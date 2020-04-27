import { Directions } from '../../../helpers/constants';
import { CollideableGameObject, Rectangle, Faction } from '../../types/objects';
import { Clamp, AngleBetweenPoints } from '../../../helpers/math';
import { Coords, Size } from '../../types/world';
import Weapon from '../../weapons/weapon';
import EngineState from '../../../EngineState';
import { GameEvent, EventType } from '../../types/events';
import { Uuid } from '../../../helpers/misc';

type PersonProps = {
	coordinates: Coords;
	faction?: Faction;
};

export default abstract class Person {
	name: string;
	weapon: Weapon;
	x: number;
	y: number;
	height: number;
	width: number;
	movementDirections = new Set();
	respawnTime: number = 3000;
	movementSpeed: number = 0;
	health: number = 1;
	rotation: number;
	isHittable = true;
	respawnPosition: Coords;
	isDead = false;
	targetCoords: Coords;
	faction: Faction;
	active = true;
	type = 'Sprite';

	constructor({ coordinates, faction }: PersonProps) {
		this.respawnPosition = coordinates;
		this.x = coordinates.x;
		this.y = coordinates.y;
		this.name = Uuid();

		if (faction) {
			this.faction = faction;
		}
	}

	abstract update({ xDiff, yDiff }: { xDiff: number; yDiff: number }): void;

	toggleMovementDirection(direction: Directions, toggleOn: boolean) {
		if (this.isDead) return;

		if (toggleOn) {
			this.movementDirections.add(direction);
		} else {
			this.movementDirections.delete(direction);
		}
	}

	stopMovement() {
		this.movementDirections.clear();
	}

	tick(frameTimeMs: number): { xDiff: number; yDiff: number } {
		let xDiff = 0;
		let yDiff = 0;

		if (this.movementDirections.size > 0) {
			const movementAmount = Math.floor((this.movementSpeed * frameTimeMs) / 100);
			const MOVEMENT_STEPS = 5;

			const splitMovementAmount = Math.floor(movementAmount / MOVEMENT_STEPS);
			for (let i = 0; i < splitMovementAmount + 1; i++) {
				// If last movement, get remainder of movement steps left after splitting into intervals of MOVEMENT_STEPS
				const movementSteps =
					i === splitMovementAmount ? movementAmount % MOVEMENT_STEPS : MOVEMENT_STEPS;
				if (movementSteps === 0) break;

				const { xDiff: newXDiff, yDiff: newYDiff } = this.validateMove(
					movementSteps,
					xDiff,
					yDiff,
				);
				xDiff = newXDiff;
				yDiff = newYDiff;
			}

			this.move(xDiff, yDiff);
		}

		if (this.targetCoords) {
			this.rotateToCoords(this.targetCoords);
		}
		this.update({ xDiff, yDiff });

		return { xDiff, yDiff };
	}

	validateMove(movementAmount, initialXDiff: number, initialYDiff: number) {
		if (movementAmount === 0) return;

		let xDiff = initialXDiff;
		let yDiff = initialYDiff;
		if (this.movementDirections.has(Directions.Forward)) yDiff -= movementAmount;
		if (this.movementDirections.has(Directions.Backward)) yDiff += movementAmount;
		if (this.movementDirections.has(Directions.Left)) xDiff -= movementAmount;
		if (this.movementDirections.has(Directions.Right)) xDiff += movementAmount;

		if (this.hasWorldCollision(this.x + xDiff, this.y)) {
			xDiff = initialXDiff;
		}
		if (this.hasWorldCollision(this.x, this.y + yDiff)) {
			yDiff = initialYDiff;
		}

		return { xDiff, yDiff };
	}

	move(xDiff: number, yDiff: number) {
		this.setPosition(Clamp(this.x + xDiff, 0, 3200), Clamp(this.y + yDiff, 0, 3200));
	}

	attack() {
		if (this.isDead) return;
		this.weapon.attack({
			attackerCoords: { x: this.x, y: this.y },
			attackerRotation: this.rotation,
			attackerSize: {
				width: this.width,
				height: this.height,
			},
			targetCoords: this.targetCoords,
		});
	}

	onDead() {
		this.isDead = true;
		this.stopMovement();
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.DEAD, {
				name: this.name,
				respawnTime: Date.now() + this.respawnTime,
			}),
		);
	}

	respawn() {
		this.health = 100;
		this.isDead = false;
		this.setPosition(this.respawnPosition.x, this.respawnPosition.y);
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}

	rotateToCoords(coords: Coords) {
		const angle = AngleBetweenPoints({ x: this.x, y: this.y }, coords);
		this.rotation = angle;
	}

	onCollide(obj: CollideableGameObject) {
		if (obj.damage && obj.owner.name !== this.name && obj.owner.faction !== this.faction) {
			this.health -= obj.damage;
			if (this.health <= 0) {
				this.health = 0;
				this.onDead();
			}
		}
	}

	hasWorldCollision(x, y) {
		// Sprite needs to be at least size of tile width/height otherwise certain collision can bug
		const objRect: Rectangle = {
			bottom: y + this.height,
			right: x + this.width,
			top: y,
			left: x,
		};

		const hasCollided = EngineState.world.checkWorldCollisionByObject(objRect);
		return hasCollided;
	}

	updateTargetCoords(x, y) {
		this.targetCoords = { x, y };
	}

	getBounds() {
		return {
			top: this.x,
			left: this.y,
			bottom: this.y + this.height,
			right: this.x + this.width,
		};
	}
}
