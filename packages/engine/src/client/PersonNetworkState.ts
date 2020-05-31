import EngineState from '../EngineState';
import { GameEvent, EventType, EventCategory } from '../common/types/events';
import { Directions } from '../helpers/constants';

// This class controls which keys are currently pressed/not pressed,
// ideally sent to the server every network tick
// TODO: Either split this class into two or make this class accept an entity name,
// 		so server engine can use this on all persons
export default class PersonNetworkState {
	// Variables set to 1 if pressed, 0 if not pressed
	primaryActionPressed: 0 | 1 = 0;
	movingUp: 0 | 1 = 0;
	movingDown: 0 | 1 = 0;
	movingLeft: 0 | 1 = 0;
	movingRight: 0 | 1 = 0;
	name = '';
	mousePos = { x: 0, y: 0 };

	constructor() {
		EngineState.eventBus.listenAllEventsByCategory(
			EventCategory.ACTION,
			this.handleActionEvent.bind(this),
		);
	}

	handleActionEvent(event: GameEvent) {
		this.name = event.payload.name;
		const { direction, pressed } = event.payload;

		switch (event.type) {
			case EventType.ACTION_PRIMARY_DOWN:
				this.primaryActionPressed = 1;
				break;
			case EventType.ACTION_PRIMARY_UP:
				this.primaryActionPressed = 0;
				break;
			case EventType.ACTION_MOVE:
				switch (direction) {
					case Directions.Forward:
						this.movingUp = pressed ? 1 : 0;
						break;
					case Directions.Backward:
						this.movingDown = pressed ? 1 : 0;
						break;
					case Directions.Left:
						this.movingLeft = pressed ? 1 : 0;
						break;
					case Directions.Right:
						this.movingRight = pressed ? 1 : 0;
						break;
				}
				break;
			case EventType.ACTION_MOUSE_MOVE:
				this.mousePos = event.payload.coords;
				break;
			case EventType.ACTION_STOP_MOVE:
				this.movingUp = 0;
				this.movingDown = 0;
				this.movingLeft = 0;
				this.movingRight = 0;
				break;
		}
	}

	// Optionally pass PlayerEvent as arg to return an event with properties different than the passed eventToDiff
	// If arg is passed, returns object containing only base props and props that have changed
	// Returns null if eventToDiff is passed and matches the props in current state
	// Otherwise returns normal PlayerEvent
	toEvent(eventToDiff?: GameEvent): GameEvent {
		const eventPayload: any = {};
		// If arg not passed, set eventToDiff to an empty object, ensuring propsToDiff map below sets all props on `event`
		if (!eventToDiff) eventToDiff = { payload: {} } as any;

		const propsToDiff = [
			'primaryActionPressed',
			'mousePos',
			'movingUp',
			'movingDown',
			'movingLeft',
			'movingRight',
		];

		// If passed event to diff doesnt exist, or if there is no difference, then eventPayload will be empty
		propsToDiff.forEach((prop) => {
			if (eventToDiff.payload[prop] !== this[prop]) {
				eventPayload[prop] = this[prop];
			}
		});

		if (Object.keys(eventPayload).length > 0) {
			return new GameEvent(EventType.NETWORK_UPDATE_PERSON_ACTIONS, {
				...eventPayload,
				name: this.name,
				timestamp: Date.now(),
			});
		}

		return null;
	}
}
