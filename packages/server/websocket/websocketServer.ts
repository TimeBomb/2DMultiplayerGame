import WebSocket from 'ws';

import WebSocketHandler from './websocketHandler';
import { WEBSOCKET_PORT } from '../config';
import ServerEngine from '../../engine/src/server/ServerEngine';

export default class WebsocketServer {
	wss: WebSocket.Server;
	serverEngine: ServerEngine;

	constructor(serverEngine: ServerEngine) {
		this.wss = new WebSocket.Server({
			clientTracking: false,
			noServer: true,
			port: WEBSOCKET_PORT,
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
		this.serverEngine = serverEngine;

		this.instantiateHandlers();
	}

	instantiateHandlers() {
		this.wss.on('connection', (ws) => {
			const wsHandler = new WebSocketHandler(ws, this.serverEngine);

			ws.on('message', wsHandler.socketMessageHandler.bind(wsHandler));

			ws.on('open', wsHandler.socketOpenHandler.bind(wsHandler));
		});
	}
}
