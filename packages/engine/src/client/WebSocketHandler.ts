import { GameEvent, EventType, PlayerEvent } from '../common/types/events';
import { serialize, deserialize } from '../helpers/serializer';
import EngineState from '../EngineState';
import PlayerNetworkState from './PlayerNetworkState';

// TODO: Send Ping/pong events to/from server/client, disconnect if nothing received, also acts as keep alive
const URL = 'ws://localhost:8123';
export default class WebSocketHandler {
	ws: WebSocket;
	connected = false;
	storedEvents: GameEvent[] = [];
	playerNetworkState: PlayerNetworkState;

	// The most up to date, unsent player network event
	// Deleted upon sending out message to the server
	latestUnsentPlayerNetworkEvent: PlayerEvent;

	// Last player network event sent
	// Used to only ensure we only update player network event state if it has changed
	lastPlayerNetworkEvent: PlayerEvent;

	constructor() {
		this.connect();

		this.playerNetworkState = new PlayerNetworkState();
		EngineState.eventBus.listen(EventType.NETWORK_TICK, this.sendMessages.bind(this));
		EngineState.eventBus.listen(EventType.ENGINE_TICK, this.handlePlayerEvent.bind(this));
	}

	connect() {
		if (this.ws) return;

		this.ws = new WebSocket(URL);
		this.ws.addEventListener('open', this.handleOpen.bind(this));
		this.ws.addEventListener('error', this.handleError.bind(this));
		this.ws.addEventListener('message', this.receiveMessages.bind(this));
		window.addEventListener('beforeunload', this.handleWindowClose.bind(this));
		window.addEventListener('close', this.handleClose.bind(this));
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

		// TODO: Use session ID to login character or relogin if disconnected
		const gameEvent = new GameEvent(EventType.NETWORK_LOGIN, {});
		this.ws.send(serialize([gameEvent]));
	}

	// Receiving message from websocket server, also need to create event upon initial player login
	receiveMessages(event: MessageEvent) {
		if (!this.connected) return;

		const gameEvents = deserialize(event) as GameEvent[];
		gameEvents.forEach((gameEvent) => EngineState.eventBus.dispatch(gameEvent));
	}

	// Every tick, grab changes in player network state and update event to send
	handlePlayerEvent(event: GameEvent) {
		const playerEvent = this.playerNetworkState.toEvent(this.lastPlayerNetworkEvent);
		if (playerEvent) {
			// Combine the last network event and this one, so we can pass all the latest props to `toEvent` above when checking if things have changed
			this.latestUnsentPlayerNetworkEvent = {
				...this.lastPlayerNetworkEvent,
				...playerEvent,
			};
			this.lastPlayerNetworkEvent = this.lastPlayerNetworkEvent;
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
		console.log('uh hi', [...this.storedEvents, this.latestUnsentPlayerNetworkEvent]);
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
}
