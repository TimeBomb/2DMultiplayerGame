import EngineState from '../EngineState';
import { EventType } from '../common/types/events';
import Shooter from '../common/entities/player/shooter';
import { Faction } from '../common/types/objects';

export default class GameEntitySpawnHandler {
	constructor() {
		EngineState.eventBus.listen(EventType.LONG_TICK, this.respawnTick);
		this.initializeMobSpawns();

		// TODO: Instead of this method, client should send signal to server when new player connects, to store entity and pass it to everyone
		this.initializePlayerSpawns();
	}

	respawnTick() {
		const currTime = Date.now();
		EngineState.world.deadGameObjects.forEach(({ name, respawnTime }) => {
			const obj = EngineState.world.gameObjects[name];
			if (currTime >= respawnTime) obj.respawn();
		});
	}

	initializeMobSpawns() {}

	initializePlayerSpawns() {
		EngineState.world.addGameObject(
			new Shooter({
				coordinates: { x: 100, y: 100 },
				faction: Faction.PLAYER,
			}),
		);
	}
}
