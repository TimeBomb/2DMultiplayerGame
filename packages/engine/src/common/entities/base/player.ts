import Person, { PersonProps } from './person';
import { Faction } from '../../types/objects';
import { AngleBetweenPoints } from '../../../helpers/math';
import Fireball from '../../projectiles/fireball';
import EngineState from '../../../EngineState';
import { EventType } from '../../types/events';

// TODO: If logic on player button press becomes more complex, make shared between
// button press methods and updateActions method
export default class Player extends Person {
	movementSpeed = 55;
	maxHealth = 1000;
	attackSpeed = 5;
	hitboxWidth = 40;
	hitboxHeight = 40;
	faction = Faction.PLAYER;
	sprite = 'player';
	weapon = Fireball;
	height = 32;
	width = 32;

	constructor(args: PersonProps) {
		super(args);
		this.health = this.maxHealth;
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

	handleBlur() {
		this.handleMouseUp();
		this.handleStopMovement();
	}
}
