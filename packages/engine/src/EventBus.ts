import { EventType, GameEvent } from './common/types/events';

export default class EventBus {
	listeners = {};

	listen(eventType: EventType, callback: (payload?: any) => void) {
		this.listeners[eventType] = this.listeners[eventType] || [];
		this.listeners[eventType].push(callback);
	}

	dispatch(event: GameEvent) {
		if (!this.listeners[event.type]) return;
		this.listeners[event.type].forEach((callback) => callback(event));
	}
}
