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
	type: EventType.NETWORK_PERSON_UPDATE;
	mousePos?: Coords;
	primaryActionPressed?: 0 | 1;
	movingUp?: 0 | 1;
	movingDown?: 0 | 1;
	movingLeft?: 0 | 1;
	movingRight?: 0 | 1;
};

// Must match prefixes used in EventType values
export enum EventCategory {
	ENGINE = 'engine',
	NETWORK = 'network',
	ACTION = 'action',
}

export enum EventType {
	ENGINE_TICK = 'engine/tick', // This is executed after the tick method is run
	ENGINE_LONG_TICK = 'engine/long_tick', // This is executed after the tick method is run

	// Game events
	ENGINE_PERSON_DEAD = 'engine/person_dead', // This is run by Person after they die
	ENGINE_GAME_OBJECT_ADDED = 'engine/game_object_added', // This is run by World after addGameObject is executed
	ENGINE_UPDATE_PERSON = 'engine/update_person', // This is run by Person after certain position or status changes or death
	ENGINE_UPDATE_PERSON_ACTIONS = 'engine/update_person_actions', // This is triggered by the server to update what buttons a player is pressing
	ENGINE_UPDATE_PROJECTILE = 'engine/update_projectile', // This is run by Projectile after position changes or death
	ENGINE_REMOVE_PROJECTILE = 'engine/remove_projectile', // This is run by Projectile when the projectile has exceeded its lifetime duration

	// Player-triggered events
	ACTION_PRIMARY_DOWN = 'action/primary_down', // i.e. Left click down
	ACTION_PRIMARY_UP = 'action/primary_up', // i.e. Left click up
	ACTION_MOVE = 'action/move', // Called when player presses movement key up or down, with `direction` and `pressed` properties
	ACTION_STOP_MOVE = 'action/stop_move', // i.e. blur window
	ACTION_MOUSE_MOVE = 'action/mouse_move', // i.e. mouse move

	// Networking events
	NETWORK_PERSON_DEAD = 'network/person_dead', // Triggered by server engine and sent to client on person death
	NETWORK_PERSON_SPAWN = ' network/person_spawn', // Triggered by server engine and sent to client on person initial spawn & respawn
	NETWORK_TICK = 'network/tick', // This triggers us to send events to the server
	NETWORK_LOGIN = 'network/login', // This is passed by the client to the server when a user starts the game up on their end
	NETWORK_BUTTON_PRESS = 'network/button_press', // This is passed by the client to the server whenever the player presses an action key
	NETWORK_PERSON_UPDATE = 'network/person_update', // This is passed by the client -> server and serevr -> client every network tick, containing data on what buttons persons are pressing
	NETWORK_LOGIN_FAILURE = 'network/login_failure', // This is passed by the server if the login is rejected
	NETWORK_LOGIN_SUCCESS = 'network/login_success', // This is passed by the server if the login is accepted, contains info on the user so we can render them
}

export function getEventCategory(eventType: EventType) {
	return eventType.substr(0, eventType.indexOf('/'));
}
