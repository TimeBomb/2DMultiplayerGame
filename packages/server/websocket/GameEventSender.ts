import { GameEvent } from '../../engine/src/common/types/events';
import { serialize } from '../../engine/src/helpers/serializer';
import WebSocketHandler from './websocketHandler';

// This sends server engine game events to client

// TODO:
// We need to 1) dispatch incoming person network state events to our engine,
// 2) send person network state events from AI and players to surrounding players
// 3) Handle resyncing players to specific coords if client is out of date,
//		Maybe ping/pong every one sec that verifies current position? Passing coords from server to client
// 4) Pass death/respawn events from server to client
// TODO: Send to client events NETWORK_PERSON_DEAD & NETWORK_PERSON_SPAWN when appropriate, based off server events
// Need to create PersonNetworkStates for all entities and send to client
export default async function gameEventSender(
	socketHandler: WebSocketHandler,
	gameEvent: GameEvent,
) {
	const eventsToSend: GameEvent[] = [];

	switch (gameEvent.type) {
	}

	socketHandler.ws.send(serialize(eventsToSend));
}
