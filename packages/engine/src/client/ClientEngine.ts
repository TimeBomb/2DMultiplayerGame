import GameEntitySpawnHandler from './GameEntitySpawnLoop';

export default class ClientEngine {
	spawnHandler: GameEntitySpawnHandler;
	constructor() {
		// TODO This spawn handler should be on server only
		this.spawnHandler = new GameEntitySpawnHandler();
	}
}
