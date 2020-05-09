import EngineState from '../EngineState';
import { EventType } from '../common/types/events';
import { spawns, enemies } from './enemySpawns';

export default class GameEntitySpawnHandler {
	constructor() {
		EngineState.eventBus.listen(EventType.LONG_TICK, this.respawnTick);
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
		Object.keys(spawns).forEach((spawnType) => {
			const spawnCoords = spawns[spawnType];
			spawnCoords.forEach((coords) => {
				EngineState.world.addGameObject(new enemies[spawnType]({ coordinates: coords }));
			});
		});
	}
}
