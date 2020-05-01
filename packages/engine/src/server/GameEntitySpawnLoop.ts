import EngineState from '../EngineState';
import { EventType } from '../common/types/events';

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

	initializeSpawns() {}
}
