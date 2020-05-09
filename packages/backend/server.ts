import WebSocket from 'ws';

import { deserialize } from '../engine/src/helpers/serializer';
import ServerEngine from '../engine/src/server/ServerEngine';
import EngineState from '../engine/src/EngineState';
import { GameEvent } from '../engine/src/common/types/events';

// TODO: Should take client events of keypresses and process in engine, this is a WIP
// Engine [for client] needs to support adding and updating entites by name - players and projectiles

// Projectiles need to only be corrected if desynced on client, should still have logic run on client
// and server at same time

// Server needs to receive login event from client, response with player entity to that specific client

// Server can start by sending all events to every person,
// but game engine should be updated somehow to get list of entities to pass to players based on X range
// around player

// Need to implement sessions, session passed to server, then server returns correct player

// Need simple data store for players location

// Server to send events containing updates to position/health/new projectiles to client

// Need to figure out how to sync, do some research, emulate lag
// Couple resources:
// https://www.gabrielgambetta.com/entity-interpolation.html
// https://webdva.github.io/how-i-implemented-client-side-linear-interpolation/

// For projectile bullet client interpolation, pick one:
// 1) Emulate fire in client, run it for real on server
// or
// 2) Client clicks fire, server creates projectile and pings back to client,
// client bullet is based off server start time/position, so its visuals more accurately match
// what the server is doing.

// Need position updates sent from server to client to include timestamp, then
// can interpolate in client based on last two positions received from server, and
// current timestamp in client, i should set position of object to X,Y
// See KingCosmic example in discord
export default class Server {
	wss: WebSocket.Server;
	engine: ServerEngine;
	constructor() {
		this.wss = new WebSocket.Server({
			port: 8123,
			perMessageDeflate: {
				zlibDeflateOptions: {
					chunkSize: 1024,
					memLevel: 7,
					level: 3,
				},
				zlibInflateOptions: {
					chunkSize: 10 * 1024,
				},
			},
		});

		console.log('WebSocket backend started on Port 8123');

		this.wss.on('connection', function connection(ws) {
			console.log('ws connected');

			// We receive player events from server
			// TODO: Figure out how to only accept websocket events at a certain rate, so we control tick rate
			// TODO: Only dispatch certain player event types
			ws.on('message', function incoming(event) {
				if (!event) return;
				try {
					const data = deserialize(event.data);
					const gameEvents = data.map(
						(eventChunk) =>
							new GameEvent(eventChunk.type, { ...eventChunk, type: undefined }),
					);
					gameEvents.forEach((gameEvent) => EngineState.eventBus.dispatch(gameEvent));
				} catch {}
			});

			ws.on('open', function handleOpen(event) {
				console.log('received open event', event);
			});

			ws.on('close', function handleClose(event) {
				console.log('received close event', event);
			});
		});

		this.engine = new ServerEngine();

		// TODO: Implement this
		// EngineState.eventBus.listenAll()
	}
}
