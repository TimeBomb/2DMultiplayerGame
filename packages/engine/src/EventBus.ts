import { EventType, GameEvent, EventCategory, getEventCategory } from './common/types/events';

export default class EventBus {
	listeners = {};
	eventTypeListeners = {};

	// If name is passed, only listens to events coming attached to the specified name
	listen(eventType: EventType, callback: (payload?: any) => void, name?: string) {
		this.listeners[eventType] = this.listeners[eventType] || [];
		if (name) {
			this.listeners[eventType][name] = this.listeners[eventType][name] || [];
			this.listeners[eventType][name].push(callback);
		} else {
			this.listeners[eventType]['all'] = this.listeners[eventType]['all'] || [];
			this.listeners[eventType]['all'].push(callback);
		}
	}

	listenAllEventsByCategory(category: EventCategory, callback: (event: GameEvent) => void) {
		this.eventTypeListeners[category] = this.eventTypeListeners[category] || [];
		this.eventTypeListeners[category].push(callback);
	}

	dispatch(event: GameEvent) {
		const eventCategory = getEventCategory(event.type);
		if (Array.isArray(this.eventTypeListeners[eventCategory])) {
			this.eventTypeListeners[eventCategory].forEach((callback) => callback(event));
		}

		if (this.listeners[event.type]) {
			// Dispatch to listeners that are listening for all events from this event type
			if (Array.isArray(this.listeners[event.type]['all'])) {
				this.listeners[event.type]['all'].forEach((callback) => callback(event));
			}

			// Dispatch to listeners that are listening to events for this specific event's name
			if (Array.isArray(this.listeners[event.type][event.payload?.name])) {
				this.listeners[event.type][event.payload.name].forEach((callback) =>
					callback(event),
				);
			}
		}
	}
}
