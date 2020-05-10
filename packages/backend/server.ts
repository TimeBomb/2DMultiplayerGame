import WebSocket from 'ws';

import websocketHandler from './websocketHandler';
import ServerEngine from '../engine/src/server/ServerEngine';

// TODO:
// Engine [for client] needs to support adding and updating entites by name

// Server needs to receive login event from client, response with player entity to that specific client

// Server can start by sending all events to every person,
// but game engine should be updated somehow to get list of entities to pass to players based on X range
// around player

// Need to implement sessions, session passed to server, then server returns correct player
// Expose REST endpoint, leverage Passport for auth, just google auth for now

// Need simple data store for players location

// Server to send events containing updates to position/health/new projectiles to client

// Need to figure out how to sync, do some research, emulate lag
// Couple resources:
// https://www.gabrielgambetta.com/entity-interpolation.html
// https://webdva.github.io/how-i-implemented-client-side-linear-interpolation/

// For projectile bullet client interpolation:
// Emulate fire in client, send fire event to server with timestamp from client.
// Server needs to interpolate projectile position based on timestamp, i.e. place into server starting
// at position based off of player position interpolated from timestamp

// Position updates should be sent to client along with player action updates, so client can
// have chars look like theyre running normally, but correct if they get out of sync

// Need a helper function for server+client to interpolate position

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

		this.wss.on('connection', websocketHandler);

		this.engine = new ServerEngine();

		// TODO: Implement sending data for entitie from server to client, listen to engine state
	}
}
