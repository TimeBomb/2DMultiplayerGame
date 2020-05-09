import { GameEvent, EventType } from '../types/events';
import EngineState from '../../EngineState';

// This keeps track of a frame tick and a long tick
// Frame tick used for game client and for network tick
// Long tick used for events that need to update only approx. a few times per second
// In the future if network tick needs to be less than frame tick, it can be added here
export default class TimeStep {
	frameTimeMS: number;
	frameTickProgress: number = 0;
	frameTickElapsed: number = 0;
	longTickMS: number;
	longTickProgress: number = 0;
	longTickElapsed: number = 0;

	constructor({ fps, longTickMS }: { fps: number; longTickMS: number }) {
		this.frameTimeMS = 1000 / fps;
		this.longTickMS = longTickMS;
	}

	tick(delta: number) {
		this.frameTickProgress += delta;
		this.longTickProgress += delta;
		if (this.frameTickProgress >= 1000) {
			this.frameTickProgress -= 1000;
		}
		if (this.longTickProgress >= 1000) {
			this.longTickProgress -= 1000;
		}

		this.frameTickElapsed += delta;
		this.longTickElapsed += delta;

		const willStep = this.frameTickElapsed >= this.frameTimeMS;
		const willLongStep = this.longTickElapsed >= this.longTickMS;

		// Step once
		if (willStep) {
			this.frameTickElapsed -= this.frameTimeMS;
			EngineState.eventBus.dispatch(new GameEvent(EventType.TICK));
		}
		if (willLongStep) {
			this.longTickElapsed -= this.longTickMS;
			EngineState.eventBus.dispatch(new GameEvent(EventType.LONG_TICK));
		}

		// Per fixed timestep, step further if timestep is out of whack
		while (this.frameTickElapsed >= this.frameTimeMS) {
			this.frameTickElapsed -= this.frameTimeMS;

			EngineState.eventBus.dispatch(new GameEvent(EventType.TICK));
			EngineState.eventBus.dispatch(new GameEvent(EventType.NETWORK_TICK));
		}
		while (this.longTickElapsed >= this.longTickMS) {
			this.longTickElapsed -= this.longTickMS;

			EngineState.eventBus.dispatch(new GameEvent(EventType.LONG_TICK));
		}
	}
}
