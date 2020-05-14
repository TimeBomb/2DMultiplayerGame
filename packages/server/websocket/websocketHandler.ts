import { deserialize } from '../../engine/src/helpers/serializer';
import { GameEvent } from '../../engine/src/common/types/events';
import gameEventHandler from './gameEventHandler';
import process from 'process';
import WebSocket from 'ws';

const MAX_EVENT_SIZE = 1000;
const DEBUG = process.argv[2] === '-d';
// TODO: Rename class to diff then engine
export default class WebSocketHandler {
	ws: WebSocket;
	constructor(websocket: WebSocket) {
		this.ws = websocket;
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
			gameEvents.forEach((gameEvent) => gameEventHandler(this.ws, gameEvent));
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
