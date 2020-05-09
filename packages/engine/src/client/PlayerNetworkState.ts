import EngineState from '../EngineState';
import { GameEvent, EventType, PlayerEvent } from '../common/types/events';
import { Coords } from '../common/types/world';

// This class controls which keys are currently pressed/not pressed,
// ideally sent to the server every network tick
export default class PlayerNetworkState {
	// Variables set to 1 if pressed, 0 if not pressed
	primaryActionPressed: 0 | 1 = 0;
	blurred: 0 | 1 = 0;
	movingUp: 0 | 1 = 0;
	movingDown: 0 | 1 = 0;
	movingLeft: 0 | 1 = 0;
	movingRight: 0 | 1 = 0;
	mousePos: Coords;

	constructor() {
		EngineState.eventBus.listenAllPlayerEvents(this.handlePlayerEvent.bind(this));
	}

	getPlayerData() {
		return {
			primaryActionPressed: this.primaryActionPressed,
			blurred: this.blurred,
			movingUp: this.movingUp,
			movingDown: this.movingDown,
			movingLeft: this.movingLeft,
			movingRight: this.movingRight,
			mousePos: this.mousePos,
		};
	}

	handlePlayerEvent(event: GameEvent) {
		switch (event.type) {
			case EventType.PLAYER_PRIMARY_DOWN:
				this.primaryActionPressed = 1;
			case EventType.PLAYER_PRIMARY_UP:
				this.primaryActionPressed = 0;
			case EventType.PLAYER_MOVE_DOWN_KEYDOWN:
				this.movingDown = 1;
			case EventType.PLAYER_MOVE_DOWN_KEYUP:
				this.movingDown = 0;
			case EventType.PLAYER_MOVE_LEFT_KEYDOWN:
				this.movingLeft = 1;
			case EventType.PLAYER_MOVE_LEFT_KEYUP:
				this.movingLeft = 0;
			case EventType.PLAYER_MOVE_RIGHT_KEYDOWN:
				this.movingRight = 1;
			case EventType.PLAYER_MOVE_RIGHT_KEYUP:
				this.movingRight = 0;
			case EventType.PLAYER_MOVE_UP_KEYDOWN:
				this.movingUp = 1;
			case EventType.PLAYER_MOVE_UP_KEYUP:
				this.movingUp = 0;
			case EventType.PLAYER_MOUSE_MOVE:
				this.mousePos = event.payload;
			case EventType.PLAYER_WINDOW_BLUR:
				this.blurred = 1;
			case EventType.PLAYER_WINDOW_FOCUS:
				this.blurred = 0;
		}
	}

	toEvent(): PlayerEvent {
		return {
			type: EventType.PLAYER_UPDATE,
			primaryActionPressed: this.primaryActionPressed,
			mousePos: this.mousePos,
			movingUp: this.blurred ? 0 : this.movingUp,
			movingDown: this.blurred ? 0 : this.movingDown,
			movingLeft: this.blurred ? 0 : this.movingLeft,
			movingRight: this.blurred ? 0 : this.movingRight,
		};
	}
}
