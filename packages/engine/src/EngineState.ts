import TimeStep from './common/utils/timestep';
import EventBus from './EventBus';
import World from './common/world';
import { EngineType } from './common/types/engine';

const FPS = 60;
const LONG_TICK_MS = 250;

export default (function () {
	return {
		engineType: null, // Set when client/server engine is initd
		timeStep: new TimeStep({ fps: FPS, longTickMS: LONG_TICK_MS }),
		eventBus: new EventBus(),
		world: new World(),
	};
})() as { timeStep: TimeStep; eventBus: EventBus; world: World; engineType?: EngineType };
