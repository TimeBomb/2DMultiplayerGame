import { Directions } from '../../../helpers/constants';
import { CollideableGameObject, Rectangle, Faction, EntityType } from '../../types/objects';
import { Clamp, AngleBetweenPoints } from '../../../helpers/math';
import { Coords, Size } from '../../types/world';
import EngineState from '../../../EngineState';
import { GameEvent, EventType } from '../../types/events';
import { Uuid } from '../../../helpers/misc';
import Projectile from '../../projectiles/projectile';

export type PersonProps = {
	coordinates: Coords;
	faction?: Faction;
};

export default abstract class Person {
	name: string;
	attackSpeed: number = 0;
	isAttacking: boolean = false;
	x: number = 0;
	y: number = 0;
	abstract height: number;
	abstract width: number;
	movementDirections = new Set();
	respawnTime: number = 3000;
	abstract movementSpeed: number;
	health: number = 0;
	abstract initialHealth: number;
	rotation: number;
	isHittable: boolean = true;
	respawnPosition: Coords;
	isDead: boolean = false;
	targetCoords: Coords;
	abstract faction: Faction;
	active: boolean = true;
	entityType: EntityType = EntityType.PERSON;
	type: string = 'Sprite';
	attackAccumulator: number = 1;
	abstract sprite: string;
	abstract weapon: typeof Projectile;

	constructor({ coordinates }: PersonProps) {
		this.respawnPosition = coordinates;
		this.x = coordinates.x;
		this.y = coordinates.y;
		this.name = Uuid();
		EngineState.eventBus.listen(EventType.TICK, this.tick.bind(this));
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

	tick(): { xDiff: number; yDiff: number } {
		if (!this.active || this.isDead) return;

		const originalX = this.x;
		const originalY = this.y;
		const originalRotation = this.rotation;
		let xDiff = 0;
		let yDiff = 0;

		// Move person
		if (this.movementDirections.size > 0) {
			const movementAmount = Math.floor(
				(this.movementSpeed * EngineState.timeStep.frameTimeMS) / 100,
			);
			// Note: Lower movement steps too much and the player can get stuck
			const MOVEMENT_STEPS = 8;

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

		// Call update after move, so we dont need to setPosition in update,
		// and before rotate, so we can update targetCoords in update
		if (this.update) this.update({ xDiff, yDiff });

		// Always be uppong attackAccumulator, so if enough time has passed, user can attack immediately upon clicking
		if (this.attackAccumulator < 1) {
			this.attackAccumulator += (this.attackSpeed * EngineState.timeStep.frameTimeMS) / 1000;
		}
		if (this.isAttacking && this.attackAccumulator >= 1) {
			this.attack();
			this.attackAccumulator = 0;
		}

		// We allow `update` to be run before rotating to target coords, since AI update target coords in the `update` method
		if (this.targetCoords) {
			this.rotateToCoords(this.targetCoords);
		}

		// Shoot off UPDATE_PERSON event
		const updatePersonEventParams: any = {
			name: this.name,
		};
		if (originalX !== this.x || originalY !== this.y) {
			updatePersonEventParams.x = this.x;
			updatePersonEventParams.y = this.y;
		}
		if (originalRotation !== this.rotation) {
			updatePersonEventParams.rotation = this.rotation;
		}
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.UPDATE_PERSON, updatePersonEventParams),
		);

		return { xDiff, yDiff };
	}

	validateMove(movementAmount, initialXDiff: number, initialYDiff: number) {
		if (movementAmount === 0) return;

		// Movement speed is slowed while moving diagonally
		if (this.movementDirections.size > 1) {
			movementAmount = Math.round(movementAmount * 0.75);
		}

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

		const projectile = new this.weapon({
			attackerSize: { width: this.width, height: this.height },
			attackerCoords: { x: this.x, y: this.y },
			ownerName: this.name,
			ownerFaction: this.faction,
			targetCoords: this.targetCoords,
		});
		projectile.initialize();

		EngineState.world.addGameObject(projectile);
	}

	onDead() {
		this.isDead = true;
		this.stopMovement();
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.PERSON_DEAD, {
				name: this.name,
				respawnTime: Date.now() + this.respawnTime,
			}),
		);
	}

	respawn() {
		this.health = this.initialHealth;
		this.isDead = false;
		this.setPosition(this.respawnPosition.x, this.respawnPosition.y);
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.UPDATE_PERSON, {
				name: this.name,
				x: this.x,
				y: this.y,
				health: this.health,
			}),
		);
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
		if (
			!this.isDead &&
			obj.damage &&
			obj.ownerName !== this.name &&
			obj.faction !== this.faction
		) {
			this.health -= obj.damage;
			if (this.health <= 0) {
				this.health = 0;
				this.onDead();
			}
		}
	}

	// This is passed the potential new position of the person, not the current position
	hasWorldCollision(x, y) {
		// Sprite needs to be at least size of tile width/height otherwise certain collisions w/ 3 collieable sides around sprite can bug
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
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			bottom: this.y + this.height,
			right: this.x + this.width,
		};
	}

	setActive(active: boolean) {
		this.active = active;
	}
}
