import EngineState from '../EngineState';
import ClientState from './ClientState';
import ClientSocketHandler from './ClientSocketHandler';
import { EngineType } from '../common/types/engine';
import { EventType, GameEvent } from '../common/types/events';
import aiTypes from '../common/aiTypes';

export default class ClientEngine {
	constructor() {
		EngineState.engineType = EngineType.CLIENT;
		EngineState.world.initialize();
		ClientState.game.initialize();
		new ClientSocketHandler();

		EngineState.eventBus.listen(EventType.NETWORK_SPAWN_PERSON, this.handleSpawn.bind(this));
	}

	handleSpawn(event: GameEvent) {
		const spawnType = event.payload.type;
		const spawnOptions = event.payload.options;
		EngineState.world.addGameObject(new aiTypes[spawnType](spawnOptions));
	}
}
