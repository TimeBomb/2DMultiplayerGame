import EngineState from '../EngineState';

export default class ServerTimeLoop {
	lastUpdate: number;

	constructor() {
		this.lastUpdate = Date.now();
		setInterval(this.tick.bind(this), EngineState.timeStep.frameTimeMS);
	}

	tick() {
		const now = Date.now();
		const delta = now - this.lastUpdate;
		this.lastUpdate = now;

		EngineState.timeStep.tick(delta);
	}
}
