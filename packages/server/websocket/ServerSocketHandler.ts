import process from 'process';
import uWS from 'uWebSockets.js';

import { deserialize, serialize } from '../../engine/src/helpers/serializer';
import { GameEvent } from '../../engine/src/common/types/events';
import gameEventReceiver from './GameEventReceiver';
import gameEventSender from './GameEventSender';
import ServerEngine from '../../engine/src/server/ServerEngine';
import PersonActionEventSender from '../PersonActionEventSender';

const MAX_EVENT_SIZE = 1000; // string size, effectively bytes or close to it
const DEBUG = process.argv[2] === '-d';

export default class ServerSocketHandler {
	ws: WebSocket;
	id: string; // id is used to ensure we only handle events coming from the user if they are for the current user's ID
	serverEngine: ServerEngine;
	personActionEventSender: PersonActionEventSender;
	eventsToSend: GameEvent[] = [];

	constructor(websocket: WebSocket, serverEngine: ServerEngine) {
		this.ws = websocket;
		this.serverEngine = serverEngine;
		this.personActionEventSender = new PersonActionEventSender();
	}

	updateEventsToSend(event: GameEvent) {
		const eventToSend = gameEventSender(event);
		if (eventToSend) {
			this.eventsToSend.push(eventToSend);
		}
	}

	handleSendEvents(additionalEvents: GameEvent[]) {
		const events = [...this.eventsToSend, ...additionalEvents];
		if (events.length > 0) {
			console.log('handling send events', events);
			this.ws.send(serialize(events));
			this.eventsToSend.length = 0;
		}
	}

	socketMessageHandler(event) {
		if (!event) return;

		if (event.length > MAX_EVENT_SIZE) {
			if (DEBUG) console.warn('max event size reached for event: ', event);
			this.ws.close();
			return;
		}

		try {
			const data = deserialize(event);
			const gameEvents = data
				.map((eventChunk) => {
					const eventType = eventChunk.type;

					delete eventChunk.type;
					return new GameEvent(eventType, eventChunk.payload);
				})
				.filter((event) => event !== null);
			gameEvents.forEach(async (gameEvent) => {
				const events = await gameEventReceiver(this, gameEvent, this.serverEngine);
				this.eventsToSend.push(...events);
			});
		} catch (e) {
			if (DEBUG) console.error('problem handling message', e);
		}
	}
}
