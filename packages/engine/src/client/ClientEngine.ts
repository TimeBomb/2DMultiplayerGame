import EngineState from '../EngineState';
import ClientState from './ClientState';
import WebSocketHandler from './WebSocketHandler';

export default class ClientEngine {
	constructor() {
		EngineState.world.initialize();
		ClientState.game.initialize();
		new WebSocketHandler();
	}
}
