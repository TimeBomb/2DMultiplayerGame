import { GameEvent, EventType } from '../common/types/events';
import { serialize, deserialize } from '../helpers/serializer';
import EngineState from '../EngineState';
import PlayerNetworkState from './PlayerNetworkState';

// TODO: Send Ping/pong events to/from server/client, disconnect if nothing received
// TODO: If disconnected from server, store events and send when reconnected
const URL = 'ws://localhost:8123';
export default class WebSocketHandler {
	ws: WebSocket;
	connected = false;
	storedPlayerEvents: GameEvent[] = [];
	playerNetworkState: PlayerNetworkState;

	constructor() {
		this.ws = new WebSocket(URL);
		this.ws.addEventListener('open', this.handleOpen.bind(this));
		this.ws.addEventListener('message', this.receiveMessages.bind(this));
		window.addEventListener('beforeunload', this.handleWindowClose.bind(this));
		window.addEventListener('close', this.handleServerClose.bind(this));

		this.playerNetworkState = new PlayerNetworkState();
		EngineState.eventBus.listen(EventType.NETWORK_TICK, this.sendMessages.bind(this));
		EngineState.eventBus.listen(EventType.TICK, this.handlePlayerEvent.bind(this));
	}

	// Connection to websocket server opens
	handleOpen() {
		this.connected = true;
		const gameEvent = new GameEvent(EventType.PLAYER_LOGIN, {});
		this.ws.send(serialize(gameEvent));
	}

	// Receiving message from websocket server
	receiveMessages(event: MessageEvent) {
		if (!this.connected) return;

		const gameEvents = deserialize(event.data) as GameEvent[];
		// TODO: Make sure this is iterating over events correctly
		gameEvents.forEach((gameEvent) => EngineState.eventBus.dispatch(gameEvent));
	}

	// Every tick, grab player network state and push to event
	handlePlayerEvent(event: GameEvent) {
		this.storedPlayerEvents.push(this.playerNetworkState.toEvent());
	}

	// Every network tick, send message to websocket server with all player network states
	sendMessages(events: GameEvent[]) {
		if (!this.connected) return;

		this.ws.send(serialize([this.playerNetworkState.toEvent()]));
		this.storedPlayerEvents.length = 0;
	}

	// Server disconnects us
	handleServerClose() {
		this.connected = false;
	}

	// User closes window
	handleWindowClose() {
		if (!this.connected) return;

		this.ws.close();
	}
}
