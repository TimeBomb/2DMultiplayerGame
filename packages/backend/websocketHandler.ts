import { deserialize } from '../engine/src/helpers/serializer';
import { GameEvent } from '../engine/src/common/types/events';
import gameEventHandler from './gameEventHandler';
import process from 'process';

const MAX_EVENT_SIZE = 1000;
const DEBUG = process.argv[2] === '-d';

export default function connection(ws) {
	if (DEBUG) console.log('ws connected');

	// We receive player events from server
	// TODO: Figure out how to only accept websocket events at a certain rate, so we control tick rate
	// TODO: Only dispatch certain player event types
	ws.on('message', function incoming(event) {
		if (!event) return;

		if (event.length > MAX_EVENT_SIZE) {
			if (DEBUG) console.warn('max event size reached for event: ', event);
			ws.close();
			return;
		}

		try {
			const data = deserialize(event);
			const gameEvents = data.map((eventChunk) => {
				const eventType = eventChunk.type;
				delete eventChunk.type;
				return new GameEvent(eventType, eventChunk);
			});
			gameEvents.forEach(gameEventHandler);
		} catch (e) {
			if (DEBUG) console.error('problem handling message', e);
		}
	});

	ws.on('open', function handleOpen(event) {
		if (DEBUG) console.log('received open event', event);
	});

	ws.on('close', function handleClose(event) {
		if (DEBUG) console.log('received close event', event);
	});
}
