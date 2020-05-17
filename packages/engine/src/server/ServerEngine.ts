import EngineState from '../EngineState';
import GameEntitySpawnHandler from './GameEntitySpawnLoop';
import ServerTimeLoop from './ServerTimeLoop';
import ServerWorldTilemap from './ServerWorldTilemap';
import { EngineType } from '../common/types/engine';

// TODO Somehow dispatch events - what needs to be dispatched? Maybe all events coming through eventbus?
export default class ServerEngine {
	engineState: typeof EngineState;
	constructor() {
		EngineState.engineType = EngineType.SERVER;
		EngineState.world.initialize();
		EngineState.world.setTilemapLayers(new ServerWorldTilemap([0, -1]));
		new GameEntitySpawnHandler();
		new ServerTimeLoop();
		this.engineState = EngineState;
	}
}
