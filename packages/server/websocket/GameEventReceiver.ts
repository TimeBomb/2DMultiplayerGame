import crypto from 'crypto';

import { GameEvent, EventType } from '../../engine/src/common/types/events';
import { getGoogleIdFromSession, getUserIdByGoogleId, getUser } from '../databaseService';
import { serialize } from '../../engine/src/helpers/serializer';
import ServerSocketHandler from './ServerSocketHandler';
import ServerEngine from '../../engine/src/server/ServerEngine';
import { EntityType } from '../../engine/src/common/types/objects';
import { PlayerType } from '../../engine/src/common/playerTypes';

// This file receives game events from client and handles them

// TODO Eventually: If we ever have another player type, we should save it to DB and send it through here on login
// TODO Eventually: We should probably have something better structured that creates game objects to spawn

async function getSpawns(serverEngine: ServerEngine) {
	const gameObjects = serverEngine.engineState.world.gameObjects;
	return Object.values(gameObjects).reduce((gameObjects, gameObject) => {
		if (gameObject.entityType === EntityType.PLAYER) {
			gameObjects.push({
				name: gameObject.name,
				x: gameObject.x,
				y: gameObject.y,
				health: gameObject.health,
				maxHealth: gameObject.maxHealth,
				playerType: gameObject.playerType,
				movementDirections: gameObject.movementDirections,
				rotation: gameObject.rotation,
				entityType: gameObject.entityType,
			});
		} else if (gameObject.entityType === EntityType.AI) {
			gameObjects.push({
				name: gameObject.name,
				x: gameObject.x,
				y: gameObject.y,
				health: gameObject.health,
				movementDirections: gameObject.movementDirections,
				rotation: gameObject.rotation,
				aiType: gameObject.aiType,
				entityType: gameObject.entityType,
			});
		} else if (gameObject.entityType === EntityType.PROJECTILE) {
			gameObjects.push({
				name: gameObject.name,
				x: gameObject.x,
				y: gameObject.y,
				born: gameObject.born,
				projectileType: gameObject.projectileType,
				entityType: gameObject.entityType,
			});
		}

		return gameObjects;
	}, []);
}

async function handleLogin(
	socketHandler: ServerSocketHandler,
	gameEvent: GameEvent,
	serverEngine: ServerEngine,
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
		user: {
			...user,
			name: gameId,
			playerType: PlayerType.Player,
		},
		spawns: await getSpawns(serverEngine),
		timestamp: Date.now(),
	});
}

export default async function gameEventReceiver(
	socketHandler: ServerSocketHandler,
	gameEvent: GameEvent,
	serverEngine: ServerEngine,
) {
	// If event coming in from user that is updating something other than the authenticated user, ignore it
	if (gameEvent.payload.name && gameEvent.payload.name !== socketHandler.id) return;

	const eventsToSend: GameEvent[] = [];

	switch (gameEvent.type) {
		case EventType.NETWORK_UPDATE_PERSON_ACTIONS:
			eventsToSend.push(
				new GameEvent(EventType.ENGINE_UPDATE_PERSON_ACTIONS, gameEvent.payload),
			);
			break;
		case EventType.NETWORK_LOGIN:
			eventsToSend.push(await handleLogin(socketHandler, gameEvent, serverEngine));
	}

	socketHandler.ws.send(serialize(eventsToSend));
}
