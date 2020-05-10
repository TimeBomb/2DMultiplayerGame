import Person, { PersonProps } from '../base/person';
import { Faction } from '../../types/objects';
import { AngleBetweenPoints } from '../../../helpers/math';
import Fireball from '../../projectiles/fireball';
import EngineState from '../../../EngineState';
import { GameEvent, EventType } from '../../types/events';
import { Directions } from '../../../helpers/constants';

// TODO: If logic on player button press becomes more complex, make shared between
// button press methods and updateActions method
export default class Shooter extends Person {
	movementSpeed = 55;
	initialHealth = 1000;
	width = 32;
	height = 32;
	attackSpeed = 5;
	hitboxWidth = 40;
	hitboxHeight = 40;
	faction = Faction.PLAYER;
	sprite = 'player';
	weapon = Fireball;

	constructor(args: PersonProps) {
		super(args);
		this.health = this.initialHealth;
		EngineState.eventBus.listen(
			EventType.ENGINE_UPDATE_PERSON_ACTIONS,
			this.updateActions.bind(this),
		);
	}

	// The target coords of a player is just their mouse, move this so their rotation angle is maintained while moving
	update({ xDiff, yDiff }) {
		if (this.targetCoords) {
			this.targetCoords.x += xDiff;
			this.targetCoords.y += yDiff;
			this.rotation = AngleBetweenPoints(this, this.targetCoords);
		}
	}

	handleMouseUp() {
		this.isAttacking = false;
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_PRIMARY_UP, { name: this.name }),
		);
	}

	handleMouseDown() {
		this.isAttacking = true;
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_PRIMARY_DOWN, { name: this.name }),
		);
	}

	handlePointerMove(x, y) {
		x = Math.round(x);
		y = Math.round(y);
		this.targetCoords = { x, y };
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_MOUSE_MOVE, { coords: { x, y }, name: this.name }),
		);
	}

	handleBlur() {
		this.isAttacking = false;
		this.stopMovement();
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_WINDOW_BLUR, { name: this.name }),
		);
	}

	handlePlayerMove(direction: Directions, toggledOn: boolean) {
		this.toggleMovementDirection(direction, toggledOn);
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_MOVE, { direction, pressed: toggledOn }),
		);
	}

	// Updates actions in response to server message
	updateActions(event: GameEvent) {
		if (event.payload.name !== this.name) return;

		const {
			mousePos,
			primaryActionPressed,
			movingUp,
			movingDown,
			movingLeft,
			movingRight,
		} = event.payload;

		if (mousePos) {
			this.updateTargetCoords(Math.round(mousePos.x), Math.round(mousePos.y));
		}

		if (typeof primaryActionPressed !== 'undefined') {
			this.isAttacking = primaryActionPressed === 1 ? true : false;
		}

		if (typeof movingUp !== 'undefined')
			this.toggleMovementDirection(Directions.Forward, movingUp === 1 ? true : false);
		if (typeof movingDown !== 'undefined')
			this.toggleMovementDirection(Directions.Backward, movingDown === 1 ? true : false);
		if (typeof movingLeft !== 'undefined')
			this.toggleMovementDirection(Directions.Left, movingLeft === 1 ? true : false);
		if (typeof movingRight !== 'undefined')
			this.toggleMovementDirection(Directions.Right, movingRight === 1 ? true : false);
	}
}
