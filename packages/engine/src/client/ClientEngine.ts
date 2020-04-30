import EngineState from '../EngineState';
import ClientState from './ClientState';

export default class ClientEngine {
	constructor() {
		EngineState.world.initialize();
		ClientState.game.initialize();
	}
}
