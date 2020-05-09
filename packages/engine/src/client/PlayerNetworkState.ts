import EngineState from '../EngineState';
import { GameEvent, EventType, PlayerEvent } from '../common/types/events';
import { Coords } from '../common/types/world';
import { Directions } from '../helpers/constants';

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
	name: string;
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
		this.name = event.payload.name
const {direction, pressed} = event.payload

		switch (event.type) {
			case EventType.PLAYER_PRIMARY_DOWN:
				this.primaryActionPressed = 1;
				break;
			case EventType.PLAYER_PRIMARY_UP:
				this.primaryActionPressed = 0;
				break;
			case EventType.PLAYER_MOVE:
				switch (direction) {
					case Directions.Forward:
						this.movingUp = pressed ? 1:0
						break;
					case Directions.Backward:
						this.movingDown = pressed ? 1:0
						break;
					case Directions.Left:
						this.movingLeft = pressed ? 1:0
						break;
					case Directions.Right:
						this.movingRight = pressed ? 1:0
						break;
					}
					break;
			case EventType.PLAYER_MOUSE_MOVE:
				this.mousePos = event.payload;
				break;
			case EventType.PLAYER_WINDOW_BLUR:
				this.blurred = 1;
				break;
			case EventType.PLAYER_WINDOW_FOCUS:
				this.blurred = 0;
				break;
		}
	}

	toEvent(): PlayerEvent {
		return {
			timestamp: Date.now(),
			name: this.name,
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
