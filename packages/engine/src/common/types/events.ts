export class GameEvent {
	type: EventType;
	payload?: any;

	constructor(eventType: EventType, payload?) {
		this.type = eventType;
		this.payload = payload;
	}
}

export enum EventType {
	TICK = 1,
	LONG_TICK,
	ATTACK,
	DEAD,
	GAME_OBJECT_ADDED,
}

export enum Events {}
