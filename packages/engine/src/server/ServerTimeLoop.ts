import EngineState from '../EngineState';

export default class ServerTimeLoop {
	lastUpdate: number = Date.now();
	constructor() {
		setInterval(this.tick, EngineState.timeStep.frameTimeMS);
	}

	tick() {
		const now = Date.now();
		const delta = now - this.lastUpdate;
		this.lastUpdate = now;

		EngineState.timeStep.tick(delta);
	}
}
