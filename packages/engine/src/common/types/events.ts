export class GameEvent {
	type: EventType;
	payload?: any;

	constructor(eventType: EventType, payload?) {
		this.type = eventType;
		this.payload = payload;
	}
}

export enum EventType {
	TICK = 1, // This is executed after the tick method is run
	LONG_TICK, // This is executed after the tick method is run
	ATTACK, // This is run by Person after attacking
	PERSON_DEAD, // This is run by Person after they die
	GAME_OBJECT_ADDED, // This is run by World after addGameObject is executed
	UPDATE_PERSON, // This is run by Person after certain position or status changes or death
	UPDATE_PROJECTILE, // This is run by Projectile after position changes or death
	REMOVE_PROJECTILE, // This is run by Projectile when the projectile has exceeded its lifetime duration
}

export enum Events {}
