import PersonActionEventSender from '../PersonActionEventSender';
import ServerEngine from '../../engine/src/server/ServerEngine';
import { EventCategory, EventType, GameEvent } from '../../engine/src/common/types/events';
import ServerSocketHandler from './ServerSocketHandler';

// This iterates through all active websockets and sends events appropriately
export default class ServerSocketMessageSender {
	personActionEventSender: PersonActionEventSender;
	serverEngine: ServerEngine;
	activeSocketHandlers: ServerSocketHandler[];

	constructor(activeSocketHandlers: ServerSocketHandler[], serverEngine: ServerEngine) {
		this.serverEngine = serverEngine;
		this.activeSocketHandlers = activeSocketHandlers;
		this.personActionEventSender = new PersonActionEventSender();

		this.serverEngine.engineState.eventBus.listenAllEventsByCategory(
			EventCategory.ENGINE,
			this.updateEventsToSend.bind(this),
		);

		this.serverEngine.engineState.eventBus.listen(
			EventType.NETWORK_TICK,
			this.handleSendEvents.bind(this),
		);
	}

	updateEventsToSend(event: GameEvent) {
		this.activeSocketHandlers.forEach((socketHandler: ServerSocketHandler) => {
			socketHandler.updateEventsToSend(event);
		});
	}

	// TODO: Only send latest person action events to sockets that are nearby the persons being updated
	handleSendEvents() {
		const latestPersonActionEvents = this.personActionEventSender.getLatestEvents();
		this.activeSocketHandlers.forEach((socketHandler: ServerSocketHandler) => {
			socketHandler.handleSendEvents(latestPersonActionEvents);
		});
	}
}
