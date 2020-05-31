import { GameEvent, EventType } from '../../engine/src/common/types/events';
import { serialize } from '../../engine/src/helpers/serializer';
import ServerSocketHandler from './ServerSocketHandler';

// This sends server engine game events to client
// TODO: This needs to only send one batch of events every single tick

// TODO:
// We need to 1) dispatch incoming person network state events to our engine,
// 2) send person network state events from AI and players to surrounding players
// 3) Handle resyncing players to specific coords if client is out of date,
//		Maybe ping/pong every one sec that verifies current position? Passing coords from server to client
// 4) Pass death/respawn events from server to client
// TODO: Send to client events NETWORK_PERSON_DEAD & NETWORK_SPAWN_PERSON when appropriate, based off server events
// Need to create PersonNetworkStates for all entities and send to client
export default async function gameEventSender(
	socketHandler: ServerSocketHandler,
	gameEvent: GameEvent,
) {
	const eventsToSend: GameEvent[] = [];

	switch (gameEvent.type) {
		case EventType.ENGINE_PERSON_DEAD:
			eventsToSend.push(
				new GameEvent(EventType.NETWORK_PERSON_DEAD, { name: gameEvent.payload.name }),
			);
			break;
		case EventType.ENGINE_SPAWN_PERSON:
			eventsToSend.push(new GameEvent(EventType.NETWORK_SPAWN_PERSON, gameEvent.payload));
			break;
		case EventType.ENGINE_UPDATE_PERSON:
			eventsToSend.push(new GameEvent(EventType.NETWORK_UPDATE_PERSON, gameEvent.payload));
			break;
		case EventType.ENGINE_UPDATE_PERSON_POSITION:
			eventsToSend.push(
				new GameEvent(EventType.NETWORK_UPDATE_PERSON_POSITION, gameEvent.payload),
			);
		case EventType.ENGINE_UPDATE_PERSON_ACTIONS:
			eventsToSend.push(
				new GameEvent(EventType.NETWORK_UPDATE_PERSON_ACTIONS, gameEvent.payload),
			);
	}

	socketHandler.ws.send(serialize(eventsToSend));
}
