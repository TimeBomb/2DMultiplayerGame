import { GameEvent, EventType } from '../../engine/src/common/types/events';

// This sends server engine game events to client
// TODO: This needs to only send one batch of events every single tick

// TODO for server [not just this file]:
// We need to 1) dispatch incoming person network state events to our engine,
// 2) send person network state events from AI and players to surrounding players
// 3) Handle resyncing players to specific coords if client is out of date,
//		Maybe ping/pong every one sec that verifies current position? Passing coords from server to client
// 4) Pass death/respawn events from server to client
// TODO: Send to client events NETWORK_PERSON_DEAD & NETWORK_SPAWN_PERSON when appropriate, based off server events
// Need to create PersonNetworkStates for all entities and send to client
export default function gameEventSender(gameEvent: GameEvent): GameEvent {
	const eventsMap = {
		[EventType.ENGINE_PERSON_DEAD]: EventType.NETWORK_PERSON_DEAD,
		[EventType.ENGINE_SPAWN_PERSON]: EventType.NETWORK_SPAWN_PERSON,
		[EventType.ENGINE_UPDATE_PERSON]: EventType.NETWORK_UPDATE_PERSON,
		[EventType.ENGINE_UPDATE_PERSON_POSITION]: EventType.NETWORK_UPDATE_PERSON_POSITION,
	};

	const newEventType = eventsMap[gameEvent.type];
	if (!newEventType) return;

	return new GameEvent(newEventType, {
		...gameEvent.payload,
		timestamp: Date.now(),
	});
}
