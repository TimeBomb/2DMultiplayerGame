import Person, { PersonProps } from '../base/person';
import { Faction } from '../../types/objects';
import { AngleBetweenPoints } from '../../../helpers/math';
import Fireball from '../../projectiles/fireball';
import EngineState from '../../../EngineState';
import { GameEvent, EventType } from '../../types/events';
import { Directions } from '../../../helpers/constants';

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
		EngineState.eventBus.dispatch(new GameEvent(EventType.PLAYER_PRIMARY_UP, {name: this.name}))
	}

	handleMouseDown() {
		this.isAttacking = true;
		EngineState.eventBus.dispatch(new GameEvent(EventType.PLAYER_PRIMARY_DOWN, {name: this.name}))
	}

	handlePointerMove(x, y) {
		this.targetCoords = { x, y };
		EngineState.eventBus.dispatch(new GameEvent(EventType.PLAYER_MOUSE_MOVE, {name: this.name}))
	}

	handleBlur() {
		this.isAttacking = false;
		this.stopMovement();
		EngineState.eventBus.dispatch(new GameEvent(EventType.PLAYER_WINDOW_BLUR, {name: this.name}))
	}

	handleFocus() {
		this.isAttacking = false;
		this.stopMovement();
		EngineState.eventBus.dispatch(new GameEvent(EventType.PLAYER_WINDOW_FOCUS, {name: this.name}))
	}

	handlePlayerMove(direction: Directions, toggledOn: boolean) {
		this.toggleMovementDirection(direction,toggledOn)
		EngineState.eventBus.dispatch(new GameEvent(EventType.PLAYER_MOVE, {direction,pressed: toggledOn}))
	}
}
