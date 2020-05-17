import { promisify } from 'util';

import databaseClient from './databaseClient';
import { Uuid } from '../engine/src/helpers/misc';
import { SESSION_EXPIRATION_TIME } from './config';

// TODO: We need to set initial health here to whatever new player max health will be
const NEW_USER = {
	x: 600,
	y: 600,
};

const get = promisify(databaseClient.get).bind(databaseClient);
const set = promisify(databaseClient.set).bind(databaseClient);
const expire = promisify(databaseClient.expire).bind(databaseClient);

export function getUserIdByGoogleId(googleId) {
	return get(`userIdFromGoogleId-${googleId}`);
}

export async function registerWithGoogleId(googleId) {
	const userId = Uuid();
	await set(`user-${userId}`, JSON.stringify(NEW_USER));
	await set(`userIdFromGoogleId-${googleId}`, userId);
}

export async function saveGoogleSession(sessionId, googleId) {
	await set(`googleSession-${sessionId}`, googleId);
	expire(sessionId, SESSION_EXPIRATION_TIME);
}

export function getGoogleIdFromSession(sessionId) {
	return get(`googleSession-${sessionId}`);
}

export async function getUser(userId) {
	const user: any = await get(`user-${userId}`);

	if (user) {
		try {
			return JSON.parse(user);
		} catch (error) {
			console.warn('User saved is not parseable as JSON for ID', userId);
			return;
		}
	}
}

export async function saveUser(userId, user) {
	return set(`user-${userId}`, JSON.stringify(user));
}
