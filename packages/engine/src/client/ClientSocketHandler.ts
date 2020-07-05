import { GameEvent, EventType } from '../common/types/events';
import { serialize, deserialize } from '../helpers/serializer';
import EngineState from '../EngineState';
import PersonNetworkState from '../common/PersonNetworkState';
import ClientState from './ClientState';

// TODO: If client reconnects to server, we need a way to relogin the user or something like that
// TODO: We're still attempting to send messages to closed websocket for some reason, it shouldnt be doing that
const URL = 'ws://localhost:8123';
export default class ClientSocketHandler {
	ws: WebSocket;
	connected = false;
	storedEvents: GameEvent[] = [];
	PersonNetworkState: PersonNetworkState;

	// The most up to date, unsent player network event
	// Deleted upon sending out message to the server
	latestUnsentPlayerNetworkEvent: GameEvent;

	// Last player network event sent
	// Used to only ensure we only update player network event state if it has changed
	lastPlayerNetworkEvent: GameEvent;

	constructor() {
		this.connect();
		this.PersonNetworkState = new PersonNetworkState();

		EngineState.eventBus.listen(EventType.NETWORK_TICK, this.sendMessages.bind(this));
		EngineState.eventBus.listen(EventType.ENGINE_TICK, this.handlePlayerEvent.bind(this));
	}

	connect() {
		if (this.ws) return;

		this.ws = new WebSocket(URL);

		// This is necessary since we use msgpack
		this.ws.binaryType = 'arraybuffer';

		this.ws.addEventListener('open', this.handleOpen.bind(this));
		this.ws.addEventListener('error', this.handleError.bind(this));
		this.ws.addEventListener('message', this.receiveMessages.bind(this));
		window.addEventListener('beforeunload', this.handleWindowClose.bind(this));
		window.addEventListener('close', this.handleClose.bind(this));

		EngineState.eventBus.listen(
			EventType.NETWORK_LOGIN_SUCCESS,
			ClientState.player.initializeOnLogin.bind(ClientState.player),
		);
		EngineState.eventBus.listen(EventType.NETWORK_LOGIN_FAILURE, this.logoutPlayer.bind(this));
	}

	// Triggers close on disconnect from client or server, which then attempts to reconnect us
	handleError(error) {
		if (this.ws.readyState === 3) {
			this.handleClose();
		} else {
			console.error('Received websocket error', error);
		}
	}

	// Connection to websocket server opens, and stop attempting to reconnect
	handleOpen() {
		if (this.connected) return;
		this.connected = true;

		const sessionCookie = document.cookie.substr(document.cookie.indexOf('__sess_game_'));
		const sessionId = sessionCookie.substr(
			sessionCookie.indexOf('=') + 1,
			sessionCookie.indexOf(';') > 0 ? sessionCookie.indexOf(';') : sessionCookie.length,
		);

		const gameEvent = new GameEvent(EventType.NETWORK_LOGIN, {
			sessionId,
		});
		this.ws.send(serialize([gameEvent]));
	}

	// Receiving message from websocket server, also need to create event upon initial player login
	receiveMessages(event: MessageEvent) {
		if (!this.connected) return;

		const gameEvents = deserialize(event.data) as GameEvent[];
		gameEvents.forEach((gameEvent) => EngineState.eventBus.dispatch(gameEvent));
	}

	// Every tick, grab changes in player network state and update event to send
	handlePlayerEvent(event: GameEvent) {
		if (!this.PersonNetworkState) return;

		const playerEvent = this.PersonNetworkState.toEvent(this.lastPlayerNetworkEvent);
		if (playerEvent) {
			// Combine the last network event and this one, so we can
			// pass all the latest props to `toEvent` above when checking if things have changed
			this.latestUnsentPlayerNetworkEvent = {
				...playerEvent,
				payload: { ...this.lastPlayerNetworkEvent?.payload, ...playerEvent.payload },
			};
			this.lastPlayerNetworkEvent = this.latestUnsentPlayerNetworkEvent;
		}
	}

	// Every network tick, send message to websocket server with all player network states
	sendMessages(events: GameEvent[]) {
		if (
			!this.connected ||
			(this.storedEvents.length === 0 && !this.latestUnsentPlayerNetworkEvent)
		) {
			return;
		}

		this.ws.send(serialize([...this.storedEvents, this.latestUnsentPlayerNetworkEvent]));
		console.log('sending events to server', [
			...this.storedEvents,
			this.latestUnsentPlayerNetworkEvent,
		]);
		this.storedEvents.length = 0;
		delete this.latestUnsentPlayerNetworkEvent;
	}

	// Server disconnects us
	handleClose() {
		delete this.ws;
		this.connected = false;

		// Attempt reconnect
		this.connect();
	}

	// User closes window
	handleWindowClose() {
		if (!this.connected) return;

		this.ws.close();
	}

	logoutPlayer() {
		console.log('logging out player');
		document.cookie = '__sess_game_=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
		window.location.href = '/';
	}
}
