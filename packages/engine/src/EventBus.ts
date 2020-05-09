import { EventType, GameEvent } from './common/types/events';

// These are events that the player triggers, e.g. button moves
const PlayerEvents: EventType[] = [
	EventType.PLAYER_PRIMARY_DOWN,
	EventType.PLAYER_PRIMARY_UP,
	EventType.PLAYER_MOVE_UP_KEYDOWN,
	EventType.PLAYER_MOVE_UP_KEYUP,
	EventType.PLAYER_MOVE_DOWN_KEYDOWN,
	EventType.PLAYER_MOVE_DOWN_KEYUP,
	EventType.PLAYER_MOVE_LEFT_KEYDOWN,
	EventType.PLAYER_MOVE_LEFT_KEYUP,
	EventType.PLAYER_MOVE_RIGHT_KEYDOWN,
	EventType.PLAYER_MOVE_RIGHT_KEYUP,
	EventType.PLAYER_WINDOW_BLUR,
	EventType.PLAYER_WINDOW_FOCUS,
	EventType.PLAYER_MOUSE_MOVE,
];

export default class EventBus {
	listeners = {};
	playerEventListeners = [];

	listen(eventType: EventType, callback: (payload?: any) => void) {
		this.listeners[eventType] = this.listeners[eventType] || [];
		this.listeners[eventType].push(callback);
	}

	listenAllPlayerEvents(callback: (event: GameEvent) => void) {
		this.playerEventListeners.push(callback);
	}

	dispatch(event: GameEvent) {
		if (!this.listeners[event.type]) return;
		this.listeners[event.type].forEach((callback) => callback(event));

		if (PlayerEvents.includes(event.type)) {
			this.playerEventListeners.forEach((callback) => callback(event));
		}
	}
}
