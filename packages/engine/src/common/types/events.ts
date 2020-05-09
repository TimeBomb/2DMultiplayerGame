import { Coords } from './world';

export class GameEvent {
	type: EventType;
	payload?: any;

	constructor(eventType: EventType, payload?) {
		this.type = eventType;
		this.payload = payload;
	}
}

export type PlayerEvent = {
	timestamp: number;
	name: string;
	type: EventType.PLAYER_UPDATE;
	mousePos: Coords;
	primaryActionPressed: 0 | 1;
	movingUp: 0 | 1;
	movingDown: 0 | 1;
	movingLeft: 0 | 1;
	movingRight: 0 | 1;
};

export enum EventType {
	TICK = 1, // This is executed after the tick method is run
	LONG_TICK, // This is executed after the tick method is run

	// Game events
	PERSON_DEAD, // This is run by Person after they die
	GAME_OBJECT_ADDED, // This is run by World after addGameObject is executed
	UPDATE_PERSON, // This is run by Person after certain position or status changes or death
	UPDATE_PROJECTILE, // This is run by Projectile after position changes or death
	REMOVE_PROJECTILE, // This is run by Projectile when the projectile has exceeded its lifetime duration

	// Player-triggered events
	PLAYER_PRIMARY_DOWN, // i.e. Left click down
	PLAYER_PRIMARY_UP, // i.e. Left click up
	PLAYER_MOVE, // Called when player presses movement key up or down, with `direction` and `pressed` properties
	PLAYER_WINDOW_BLUR, // i.e. blur window
	PLAYER_WINDOW_FOCUS, // i.e. window has been focused
	PLAYER_MOUSE_MOVE, // i.e. mouse move

	// Networking events
	NETWORK_TICK, // This triggers us to send events to the server
	PLAYER_LOGIN, // This is passed by the client to the server when a user starts the game up on their end
	UPDATE_ENTITY, // This is passed by the server to the client to update game object state
	BUTTON_PRESS, // This is passed by the client to the server whenever the player presses an action key
	PLAYER_UPDATE, // This is passed by the client to the server every network tick, containing data on what the player is pressing
}

export enum Events {}
