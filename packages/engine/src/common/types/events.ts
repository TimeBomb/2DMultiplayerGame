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
	type: EventType.NETWORK_PLAYER_UPDATE;
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
	ACTION_MOVE = 'action/player_move', // Called when player presses movement key up or down, with `direction` and `pressed` properties
	ACTION_WINDOW_BLUR = 'action/window_blur', // i.e. blur window
	ACTION_MOUSE_MOVE = 'action/mouse_move', // i.e. mouse move

	// Networking events
	NETWORK_TICK = 'network/tick', // This triggers us to send events to the server
	NETWORK_LOGIN = 'network/login', // This is passed by the client to the server when a user starts the game up on their end
	NETWORK_UPDATE_ENTITY = 'network/update_entity', // This is passed by the server to the client to update game object state
	NETWORK_BUTTON_PRESS = 'network/button_press', // This is passed by the client to the server whenever the player presses an action key
	NETWORK_PLAYER_UPDATE = 'network/player_update', // This is passed by the client to the server every network tick, containing data on what the player is pressing
}

export function getEventCategory(eventType: EventType) {
	const eventCategoryStr = eventType.substr(0, eventType.indexOf('/'));
	return EventCategory[eventCategoryStr];
}
