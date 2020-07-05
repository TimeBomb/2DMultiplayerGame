import uWS from 'uWebSockets.js';
import http from 'http';
import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { google } from 'googleapis';
import { resolve } from 'path';
import uid from 'uid';

import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './secrets';
import { saveGoogleSession, getUserIdByGoogleId, registerWithGoogleId } from './databaseService';
import {
	REST_SERVER_URL,
	SESSION_COOKIE_NAME,
	EXPRESS_PORT,
	SESSION_EXPIRATION_TIME,
} from './config';
import ServerEngine from '../engine/src/server/ServerEngine';

// TODO:
// Engine [for client] needs to support adding and updating entites by name

// Server can start by sending all events to every person,
// but game engine should be updated somehow to get list of entities to pass to players based on X range
// around player

// Need to figure out how to sync, do some research, emulate lag
// Couple resources:
// https://www.gabrielgambetta.com/entity-interpolation.html
// https://webdva.github.io/how-i-implemented-client-side-linear-interpolation/

// For projectile bullet client interpolation:
// Emulate fire in client, send fire event to server with timestamp from client.
// Server needs to interpolate projectile position based on timestamp, i.e. place into server starting
// at position based off of player position interpolated from timestamp

// Position updates should be sent to client along with player action updates, so client can
// have chars look like theyre running normally, but correct if they get out of sync

// Need a helper function for server+client to interpolate position

// Need position updates sent from server to client to include timestamp, then
// can interpolate in client based on last two positions received from server, and
// current timestamp in client, in should set position of object to X,Y
// See KingCosmic example in discord

// TODO: New file should handle spawning enemies
// Another file should handle configuring types of enemies, so we can just
//  provide single var for instant config of enemy type
// Player positions need to be saved

// After server is in a comfortable position, need to get a UI up maybe with Preact,
// Preact UI can leverage global window state object that gets data set based on websocket info
// After that, should probably dive into basic equipment support
// Eventually loot and gathering...

// TODO Eventually: Change network tick rate from 60 to 30.
// Every two ticks of the client, send both ticks to the server

// TODO: Any way to add some sort of encryption to server and client for websocket data?

export default class Server {
	app: Express;
	server: http.Server;
	wss: WebSocket.Server;
	sockets: Map<string, WebSocket>;
	googleClient: any;
	serverEngine: ServerEngine;

	constructor() {
		this.app = express();
		this.sockets = new Map();
		this.serverEngine = new ServerEngine();

		this.app.use(express.static(resolve(__dirname, '../web/public')));
		this.app.use(cookieParser());
		this.app.use(bodyParser.urlencoded({ extended: true }));

		this.googleClient = new google.auth.OAuth2(
			GOOGLE_CLIENT_ID,
			GOOGLE_CLIENT_SECRET,
			`${REST_SERVER_URL}/auth/google/callback`,
		);

		google.options({ auth: this.googleClient });

		this.server = http.createServer(this.app);

		this.instantiateRoutes();

		this.server.listen(EXPRESS_PORT, () => {
			console.log('Server started on port', EXPRESS_PORT);
		});
	}

	instantiateRoutes() {
		this.app.get('/', (req, res) => {
			res.sendFile(resolve(__dirname, '../web/landing-page.html'));
		});

		this.app.get('/play', (req, res) => {
			if (!req.cookies[SESSION_COOKIE_NAME]) {
				return res.redirect('/');
			}
			res.sendFile(resolve(__dirname, '../web/game.html'));
		});

		this.app.post('/login', async (req, res) => {
			let tokenPayload: any = {};
			try {
				const token = req.body.idtoken;
				const ticket = await this.googleClient.verifyIdToken({
					idToken: token,
					audience: GOOGLE_CLIENT_ID,
				});
				tokenPayload = ticket.getPayload();
			} catch (err) {
				// If token is invalid for some reason or doesnt verify, then error would be thrown
				res.sendStatus(400);
				return;
			}

			const googleId = tokenPayload.sub;
			const sessionId = `goog--${Math.random() * 10000}--${uid(24)}--`;

			res.cookie(SESSION_COOKIE_NAME, sessionId, {
				maxAge: SESSION_EXPIRATION_TIME * 1000,
				sameSite: 'lax',
			});

			saveGoogleSession(sessionId, googleId);

			const userId = await getUserIdByGoogleId(googleId);
			if (!userId) {
				await registerWithGoogleId(googleId);
			}

			res.redirect('/play');
		});

		this.app.delete('/logout', function (request, response) {
			// TODO: Logout, remove session
		});
	}
}
