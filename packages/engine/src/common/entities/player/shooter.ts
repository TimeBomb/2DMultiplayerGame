import Person, { PersonProps } from '../base/person';
import { Faction } from '../../types/objects';
import { AngleBetweenPoints } from '../../../helpers/math';
import Fireball from '../../projectiles/fireball';

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

	constructor({ coordinates }: PersonProps) {
		super({ coordinates });
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
	}

	handleMouseDown() {
		this.isAttacking = true;
	}

	handlePointerMove(x, y) {
		this.targetCoords = { x, y };
	}

	handleBlur() {
		this.isAttacking = false;
		this.stopMovement();
	}
}
