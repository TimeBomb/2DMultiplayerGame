import EngineState from '../EngineState';
import { EventType } from '../common/types/events';
import { spawns } from './npcSpawns';

export default class GameEntitySpawnHandler {
	constructor() {
		EngineState.eventBus.listen(EventType.ENGINE_LONG_TICK, this.respawnTick);
		this.initializeSpawns();
	}

	respawnTick() {
		const currTime = Date.now();
		EngineState.world.deadGameObjects.forEach(({ name, respawnTime }) => {
			const obj = EngineState.world.gameObjects[name];
			if (currTime >= respawnTime) obj.respawn();
		});
	}

	initializeSpawns() {
		spawns.forEach((spawn) => {
			EngineState.world.addGameObject(spawn.type(spawn.options));
		});
	}
}
