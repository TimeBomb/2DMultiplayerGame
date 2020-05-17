import crypto from 'crypto';

import { GameEvent, EventType } from '../../engine/src/common/types/events';
import { getGoogleIdFromSession, getUserIdByGoogleId, getUser } from '../databaseService';
import { serialize } from '../../engine/src/helpers/serializer';
import WebSocketHandler from './websocketHandler';

// This file receives game events from client and handles them

async function handleLogin(
	socketHandler: WebSocketHandler,
	gameEvent: GameEvent,
): Promise<GameEvent> {
	const rejectLogin = (errorCode) => {
		return new GameEvent(EventType.NETWORK_LOGIN_FAILURE, {
			errorCode: errorCode,
		});
	};

	const sessionId = gameEvent.payload?.sessionId;
	if (typeof sessionId !== 'string') {
		return rejectLogin(1);
	}

	if (sessionId.indexOf('goog') !== 0) {
		// Session is not google session, so not supported
		return rejectLogin(2);
	}

	const googleId = await getGoogleIdFromSession(sessionId);
	if (!googleId) {
		return rejectLogin(3);
	}

	const userId = await getUserIdByGoogleId(googleId);
	if (!userId) {
		return rejectLogin(4);
	}

	const user = await getUser(userId);
	if (!user) {
		return rejectLogin(5);
	}

	const gameId = crypto.createHash('md5').update(userId).digest('hex');
	socketHandler.id = gameId;
	return new GameEvent(EventType.NETWORK_LOGIN_SUCCESS, {
		...user,
		id: gameId,
	});
}

export default async function gameEventReceiver(
	socketHandler: WebSocketHandler,
	gameEvent: GameEvent,
) {
	if (gameEvent.payload.name && gameEvent.payload.name !== socketHandler.id) return;

	const eventsToSend: GameEvent[] = [];

	switch (gameEvent.type) {
		case EventType.NETWORK_PERSON_UPDATE:
			eventsToSend.push(
				new GameEvent(EventType.ENGINE_UPDATE_PERSON_ACTIONS, gameEvent.payload),
			);
			break;
		case EventType.NETWORK_LOGIN:
			eventsToSend.push(await handleLogin(socketHandler, gameEvent));
	}

	socketHandler.ws.send(serialize(eventsToSend));
}
