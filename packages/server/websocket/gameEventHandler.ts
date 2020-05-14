import { GameEvent, EventType } from '../../engine/src/common/types/events';
import EngineState from '../../engine/src/EngineState';
import { getGoogleIdFromSession, getUserIdByGoogleId, getUser } from '../databaseService';
import { serialize } from '../../engine/src/helpers/serializer';

// TODO: Some events should be dispatched to engine, some should be dispatched back to the socket they came from. We handle the latter
export default async function gameEventHandler(webSocket: WebSocket, gameEvent: GameEvent) {
	const eventsToSend: GameEvent[] = [];

	switch (gameEvent.type) {
		case EventType.NETWORK_PLAYER_UPDATE:
			eventsToSend.push(
				new GameEvent(EventType.ENGINE_UPDATE_PERSON_ACTIONS, gameEvent.payload),
			);
			break;
		case EventType.NETWORK_LOGIN:
			const rejectLogin = (errorCode) => {
				eventsToSend.push(
					new GameEvent(EventType.NETWORK_LOGIN_FAILURE, {
						errorCode: errorCode,
					}),
				);
			};

			const sessionId = gameEvent.payload?.sessionId;
			if (typeof sessionId !== 'string') {
				rejectLogin(1);
				return;
			}

			if (sessionId.indexOf('goog') !== 0) {
				// Session is not google session, so not supported
				rejectLogin(2);
				return;
			}

			const googleId = await getGoogleIdFromSession(sessionId);
			if (!googleId) {
				rejectLogin(3);
				return;
			}

			const userId = await getUserIdByGoogleId(googleId);
			if (!userId) {
				rejectLogin(4);
				return;
			}

			const user = await getUser(userId);
			if (!user) {
				rejectLogin(5);
				return;
			}

			eventsToSend.push(
				new GameEvent(EventType.NETWORK_LOGIN_SUCCESS, {
					...user,
				}),
			);
	}

	webSocket.send(serialize(eventsToSend));
}
