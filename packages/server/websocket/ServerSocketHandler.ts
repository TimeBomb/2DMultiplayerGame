import process from 'process';
import WebSocket from 'ws';

import { deserialize } from '../../engine/src/helpers/serializer';
import { GameEvent, EventCategory } from '../../engine/src/common/types/events';
import gameEventReceiver from './GameEventReceiver';
import gameEventSender from './GameEventSender';
import ServerEngine from '../../engine/src/server/ServerEngine';

const MAX_EVENT_SIZE = 1000; // string size, effectively bytes or close to it
const DEBUG = process.argv[2] === '-d';

export default class ServerSocketHandler {
	ws: WebSocket;
	id: string; // id is used to ensure we only handle events coming from the user if they are for the current user's ID
	serverEngine: ServerEngine;

	constructor(websocket: WebSocket, serverEngine: ServerEngine) {
		this.ws = websocket;
		this.serverEngine = serverEngine;

		this.serverEngine.engineState.eventBus.listenAllEventsByCategory(
			EventCategory.ENGINE,
			(gameEvent: GameEvent) => gameEventSender(this, gameEvent),
		);
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
			gameEvents.forEach((gameEvent) =>
				gameEventReceiver(this, gameEvent, this.serverEngine),
			);
		} catch (e) {
			if (DEBUG) console.error('problem handling message', e);
		}
	}

	socketOpenHandler(event) {
		if (DEBUG) console.log('received open event', event);
	}

	socketCloseHandler(event) {
		if (DEBUG) console.log('received close event', event);
	}
}
