import process from 'process';
import WebSocket from 'ws';

import { deserialize } from '../../engine/src/helpers/serializer';
import { GameEvent, EventCategory } from '../../engine/src/common/types/events';
import gameEventReceiver from './GameEventReceiver';
import gameEventSender from './GameEventSender';
import ServerEngine from '../../engine/src/server/ServerEngine';

const MAX_EVENT_SIZE = 1000;
const DEBUG = process.argv[2] === '-d';
// TODO: Rename class to diff then engine
export default class WebSocketHandler {
	ws: WebSocket;
	id: string;
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
			const gameEvents = data.map((eventChunk) => {
				const eventType = eventChunk.type;
				delete eventChunk.type;
				return new GameEvent(eventType, eventChunk.payload);
			});
			gameEvents.forEach((gameEvent) => gameEventReceiver(this, gameEvent));
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
