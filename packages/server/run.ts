import Server from './server';
import WebSocketServer from './websocket/WebSocketServer';

const server = new Server();
new WebSocketServer(server.serverEngine);
