import Server from './server';
import WebsocketServer from './websocket/websocketServer';

const server = new Server();
new WebsocketServer(server.engineState);
