import { Directions } from '../../../helpers/constants';
import { CollideableGameObject, Rectangle, Faction, EntityType } from '../../types/objects';
import { Clamp, AngleBetweenPoints } from '../../../helpers/math';
import { Coords } from '../../types/world';
import EngineState from '../../../EngineState';
import { GameEvent, EventType } from '../../types/events';
import Projectile from './projectile';
import { nanoid } from 'nanoid';

export type PersonProps = {
	coordinates: Coords;
	faction?: Faction;
	doTick?: boolean;
	health?: number;
	name?: string;
	sprite?: string;
	movementDirections?: Set<Directions>;
	rotation?: number;
};

export default abstract class Person {
	name: string;
	attackSpeed = 0;
	isAttacking = false;
	x = 0;
	y = 0;
	abstract height: number;
	abstract width: number;
	movementDirections: Set<Directions> = new Set();
	respawnTime = 3000;
	abstract movementSpeed: number;
	health = 0;
	abstract maxHealth: number;
	rotation: number;
	isHittable = true;
	respawnPosition: Coords;
	isDead = false;
	targetCoords: Coords;
	abstract faction: Faction;
	active = true;
	abstract entityType: EntityType;

	type = 'Sprite';
	attackAccumulator = 1;
	doTick = true;
	sprite: string;
	abstract weapon: (EngineProjectileProps) => Projectile;

	// TODO: May not need `doTick` here, was originally intended to disable tick on client-side stuff
	constructor({
		coordinates,
		doTick,
		name,
		sprite,
		movementDirections,
		rotation,
		health,
	}: PersonProps) {
		if (sprite) this.sprite = sprite;
		if (typeof doTick !== 'undefined') this.doTick = doTick;
		this.respawnPosition = coordinates;
		this.x = coordinates.x;
		this.y = coordinates.y;
		if (movementDirections) this.movementDirections = movementDirections;
		if (typeof rotation !== 'undefined') this.rotation = rotation;
		if (typeof health !== 'undefined') this.health = health;
		this.name = name || nanoid();

		EngineState.eventBus.listen(EventType.ENGINE_TICK, this.tick.bind(this));
		EngineState.eventBus.listen(
			EventType.NETWORK_UPDATE_PERSON_POSITION,
			this.handlePersonUpdate.bind(this),
			this.name,
		);
		EngineState.eventBus.listen(
			EventType.NETWORK_UPDATE_PERSON,
			this.handlePersonUpdate.bind(this),
			this.name,
		);
		EngineState.eventBus.listen(
			EventType.NETWORK_PERSON_DEAD,
			this.onDead.bind(this),
			this.name,
		);
		EngineState.eventBus.listen(
			EventType.NETWORK_UPDATE_PERSON_ACTIONS,
			this.handlePersonActionsUpdate.bind(this),
			this.name,
		);
	}

	abstract update({ xDiff, yDiff }: { xDiff: number; yDiff: number }): void;

	handlePersonUpdate(event: GameEvent) {
		const payload = event.payload;
		if (
			typeof payload.x === 'number' ||
			typeof payload.y === 'number' ||
			typeof payload.rotation === 'number'
		) {
			if (payload.x || payload.y) {
				this.x = payload.x;
				this.y = payload.y;
			}
			if (payload.rotation) {
				this.rotation = payload.rotation;
			}

			EngineState.eventBus.dispatch(
				new GameEvent(EventType.ENGINE_UPDATE_PERSON_POSITION, payload),
			);
		} else {
			if (typeof payload.health === 'number') {
				this.health = payload.health;
			}
		}
	}

	handlePersonActionsUpdate(event: GameEvent) {
		const {
			primaryActionPressed,
			movingUp,
			movingDown,
			movingLeft,
			movingRight,
			mousePos,
		} = event.payload;

		primaryActionPressed ? this.onMouseDown() : this.onMouseUp();
		this.toggleMovementDirection(Directions.Forward, movingUp);
		this.toggleMovementDirection(Directions.Left, movingLeft);
		this.toggleMovementDirection(Directions.Backward, movingDown);
		this.toggleMovementDirection(Directions.Right, movingRight);
		this.updateTargetCoords(mousePos.x, mousePos.y);
	}

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

	tick() {
		if (!this.active || this.isDead || !this.doTick) return;

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

		const isPositionChanged = originalX !== this.x || originalY !== this.y;
		const isRotationChanged = originalRotation !== this.rotation;

		// Shoot off UPDATE_PERSON event
		if (isPositionChanged || isRotationChanged) {
			const updatePersonEventParams: any = {
				name: this.name,
			};

			if (isPositionChanged) {
				updatePersonEventParams.x = this.x;
				updatePersonEventParams.y = this.y;
			}
			if (isRotationChanged) {
				updatePersonEventParams.rotation = this.rotation;
			}

			EngineState.eventBus.dispatch(
				new GameEvent(EventType.ENGINE_UPDATE_PERSON_POSITION, updatePersonEventParams),
			);
		}
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
		if (this.isDead || !this.targetCoords) return;

		const projectile = this.weapon({
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
			new GameEvent(EventType.ENGINE_PERSON_DEAD, {
				name: this.name,
				respawnTime: Date.now() + this.respawnTime,
			}),
		);
	}

	respawn() {
		this.health = this.maxHealth;
		this.isDead = false;
		this.setPosition(this.respawnPosition.x, this.respawnPosition.y);
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ENGINE_UPDATE_PERSON_POSITION, {
				name: this.name,
				x: this.x,
				y: this.y,
			}),
		);
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ENGINE_UPDATE_PERSON, {
				name: this.name,
				health: this.maxHealth,
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
			} else {
				EngineState.eventBus.dispatch(
					new GameEvent(EventType.ENGINE_UPDATE_PERSON, {
						name: this.name,
						health: this.health,
					}),
				);
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

	// TODO: May not need this method to exist since it's so simple
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

	onMouseUp() {
		this.isAttacking = false;
	}

	onMouseDown() {
		this.isAttacking = true;
	}

	onStopMovement() {
		this.movementDirections.clear();
	}

	onPointerMove(coords: Coords) {
		const x = Math.round(coords.x);
		const y = Math.round(coords.y);
		this.targetCoords = { x, y };
	}

	onMove(direction, toggledOn) {
		this.toggleMovementDirection(direction, toggledOn);
	}

	handleMouseUp() {
		this.onMouseUp();
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_PRIMARY_UP, { name: this.name }),
		);
	}

	handleMouseDown() {
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_PRIMARY_DOWN, { name: this.name }),
		);
	}

	handleStopMovement() {
		this.onStopMovement();
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_STOP_MOVE, { name: this.name }),
		);
	}

	handlePointerMove(coords: Coords) {
		this.onPointerMove(coords);
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.ACTION_MOUSE_MOVE, { coords, name: this.name }),
		);
	}

	handleMove(direction: Directions, toggledOn: boolean) {
		this.onMove(direction, toggledOn);
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
