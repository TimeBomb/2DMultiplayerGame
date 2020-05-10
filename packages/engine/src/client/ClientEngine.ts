import EngineState from '../EngineState';
import ClientState from './ClientState';
import WebSocketHandler from './WebSocketHandler';
import { EngineType } from '../common/types/engine';

export default class ClientEngine {
	constructor() {
		EngineState.engineType = EngineType.CLIENT;
		EngineState.world.initialize();
		ClientState.game.initialize();
		new WebSocketHandler();
	}
}
