import TimeStep from './common/utils/timestep';
import EventBus from './EventBus';
import World from './common/world';

const FPS = 60;
const LONG_TICK_MS = 250;

export default (function () {
	return {
		timeStep: new TimeStep({ fps: FPS, longTickMS: LONG_TICK_MS }),
		eventBus: new EventBus(),
		world: new World(),
	};
})();
