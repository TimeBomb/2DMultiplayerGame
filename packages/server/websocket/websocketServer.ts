import uWS from 'uWebSockets.js';

import ServerSocketHandler from './ServerSocketHandler';
import { WEBSOCKET_PORT } from '../config';
import ServerEngine from '../../engine/src/server/ServerEngine';
import ServerSocketMessageSender from './ServerSocketMessageSender';

// Every ping duration [milliseconds], we check to make sure client sockets are still connected
const PING_DURATION = 30000;

export default class WebsocketServer {
	wss: uWS.;
	serverEngine: ServerEngine;
	activeSocketHandlers: ServerSocketHandler[] = [];
	serverSocketMessageSender: ServerSocketMessageSender;

	constructor(serverEngine: ServerEngine) {
		this.wss = uWS.App({
			
		}).listen(WEBSOCKET_PORT);
		this.serverEngine = serverEngine;

		this.instantiateHandlers();
		this.serverSocketMessageSender = new ServerSocketMessageSender(
			this.activeSocketHandlers,
			this.serverEngine,
		);
	}

	instantiateHandlers() {
		this.wss.on('connection', (ws) => {
			ws.isAlive = true;
			const socketHandler = new ServerSocketHandler(ws, this.serverEngine);
			this.activeSocketHandlers.push(socketHandler);

			// Pong messages are automatically sent in response to ping messages, per websocket specs and `ws`
			ws.on('pong', () => {
				ws.isAlive = true;
			});

			ws.on('message', socketHandler.socketMessageHandler.bind(socketHandler));
		});

		const interval = setInterval(() => {
			// Ping/Pong keepalive test: Mark sockets as not alive, then immediately ping them. Upon them being pinged,
			// they should send pong per websocket spec, and thus be set back to isAlive
			// Therefore the next time this will be called, isAlive will still be true
			// UNLESS websocket doesn't reply with pong, which means it is dead, and it will be removed
			this.activeSocketHandlers.forEach((socketHandler) => {
				if (socketHandler.ws.isAlive === false) {
					// Remove from activeSocketHandlers and close websocket
					const socketIndex = this.activeSocketHandlers.findIndex(
						(activeSocketHandler) => activeSocketHandler === socketHandler,
					);
					this.activeSocketHandlers.splice(socketIndex, 1);
					return socketHandler.ws.close();
				}

				socketHandler.ws.isAlive = false;
				// eslint-disable-next-line @typescript-eslint/no-empty-function
				socketHandler.ws.ping(); // Automatically makes client send back pong message
			});
		}, PING_DURATION);

		this.wss.on('close', () => {
			clearInterval(interval);
		});
	}
}
