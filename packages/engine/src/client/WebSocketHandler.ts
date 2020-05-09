import { GameEvent, EventType } from '../common/types/events';
import { serialize, deserialize } from '../helpers/serializer';
import EngineState from '../EngineState';
import PlayerNetworkState from './PlayerNetworkState';

// TODO: Send Ping/pong events to/from server/client, disconnect if nothing received
// TODO: If disconnected from server, store events and send when reconnected
const URL = 'ws://localhost:8123';
export default class WebSocketHandler {
	ws: WebSocket;
	connected: boolean = false;
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

	// Receive client event message from our event bus
	handlePlayerEvent(event: GameEvent) {
		this.storedPlayerEvents.push(event);
	}

	// Send message to the websocket server
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
