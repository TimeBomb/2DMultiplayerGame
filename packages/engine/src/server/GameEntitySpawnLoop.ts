import EngineState from '../EngineState';
import { EventType, GameEvent } from '../common/types/events';
import { spawns } from './npcSpawns';
import aiTypes from '../common/aiTypes';

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
			EngineState.world.addGameObject(aiTypes[spawn.type](spawn.options));
			EngineState.eventBus.dispatch(new GameEvent(EventType.ENGINE_SPAWN_PERSON, spawn));
		});
	}
}
