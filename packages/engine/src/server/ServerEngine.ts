import EngineState from '../EngineState';
import GameEntitySpawnHandler from './GameEntitySpawnLoop';
import ServerTimeLoop from './ServerTimeLoop';
import ServerWorldTilemap from './ServerWorldTilemap';

// TODO Somehow dispatch events - what needs to be dispatched? Maybe all events coming through eventbus?
export default class ServerEngine {
	engineState: typeof EngineState;

	constructor() {
		this.engineState = EngineState;

		EngineState.world.initialize();
		EngineState.world.setTilemapLayers(new ServerWorldTilemap([0, -1]));
		new GameEntitySpawnHandler();
		new ServerTimeLoop();
	}
}
