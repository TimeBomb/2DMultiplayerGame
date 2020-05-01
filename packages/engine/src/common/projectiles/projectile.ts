import { Uuid } from '../../helpers/misc';
import EngineState from '../../EngineState';
import { CollideableGameObject, WeaponModifiers, EntityType, Faction } from '../types/objects';
import { GameEvent, EventType } from '../types/events';
import { Coords } from '../types/world';

export default class Projectile {
	x: number = 0;
	y: number = 0;
	width: number = 0;
	height: number = 0;
	name: string;
	direction: number;
	xSpeed: number = 0;
	ySpeed: number = 0;
	bulletLifetime: number = 0;
	damage: number = 0;
	born: number = 0;
	ownerName: string; // Identifier of the person that shot this bullet
	faction: Faction;
	active: boolean = true;
	modifiers: WeaponModifiers;
	entityType: EntityType = EntityType.PROJECTILE;
	type: string = 'Image';
	deleted: boolean = false;
	attackerCoords: Coords;
	attackerSize: { width: number; height: number };
	targetCoords: Coords;
	sprite: string;

	constructor({
		ownerName,
		ownerFaction,
		modifiers,
		attackerCoords,
		targetCoords,
		attackerSize,
	}: {
		ownerName: string;
		ownerFaction: Faction;
		modifiers?: WeaponModifiers;
		attackerCoords: Coords;
		targetCoords: Coords;
		attackerSize: { width: number; height: number };
	}) {
		this.name = Uuid();
		this.ownerName = ownerName;
		this.faction = ownerFaction;
		this.modifiers = modifiers;
		this.attackerCoords = attackerCoords;
		this.targetCoords = targetCoords;
		this.attackerSize = attackerSize;

		EngineState.eventBus.listen(EventType.TICK, this.tick.bind(this));
	}

	initialize() {
		let xMod = 0;
		let yMod = 0;
		const yDiff = this.attackerCoords.y - this.targetCoords.y;
		const xDiff = this.attackerCoords.x - this.targetCoords.x;

		// This logic tries to make the bullet appear appropriately in front of the player
		// It's close to accurate but not perfect, may need to tinker more with it
		// Likely need to incorporate the size of the bullet somewhere
		const gameWidth = 800;
		const gameHeight = 600;
		const widthDivider = gameWidth / this.attackerSize.width;
		const heightDivider = gameHeight / this.attackerSize.height;
		if (xDiff > 0) xMod -= Math.max(xDiff / widthDivider, this.attackerSize.width / 2);
		if (xDiff < 0) xMod += Math.max(xDiff / widthDivider, this.attackerSize.width / 2);
		if (yDiff > 0) yMod -= Math.max(yDiff / heightDivider, this.attackerSize.height / 2);
		if (yDiff < 0) yMod += Math.max(yDiff / heightDivider, this.attackerSize.height / 2);

		this.x = this.attackerCoords.x + xMod;
		this.y = this.attackerCoords.y + yMod; // Initial position

		this.direction = Math.atan((this.targetCoords.x - this.x) / (this.targetCoords.y - this.y));

		// Calculate X and y velocity of bullet to moves it from this.attackerCoords to target
		if (this.targetCoords.y >= this.y) {
			this.xSpeed = this.xSpeed * Math.sin(this.direction);
			this.ySpeed = this.ySpeed * Math.cos(this.direction);
		} else {
			this.xSpeed = -this.xSpeed * Math.sin(this.direction);
			this.ySpeed = -this.ySpeed * Math.cos(this.direction);
		}
	}

	tick() {
		if (!this.active) return;

		const originalX = this.x;
		const originalY = this.y;

		this.x += this.xSpeed * EngineState.timeStep.frameTimeMS;
		this.y += this.ySpeed * EngineState.timeStep.frameTimeMS;
		this.born += EngineState.timeStep.frameTimeMS;

		const objRect = {
			bottom: this.y + this.height,
			right: this.x + this.width,
			top: this.y,
			left: this.x,
		};
		const hasCollided = EngineState.world.checkWorldCollisionByObject(objRect);

		if (hasCollided || this.born >= this.bulletLifetime) {
			this.remove();
		}

		if (originalX !== this.x || originalY !== this.y) {
			EngineState.eventBus.dispatch(
				new GameEvent(EventType.UPDATE_PROJECTILE, {
					name: this.name,
					x: this.x,
					y: this.y,
				}),
			);
		}
	}

	onCollide(obj: CollideableGameObject) {
		// If can't collide with object, or object is owner of this bullet, don't trigger collision
		if (!obj.isHittable || obj.name === this.ownerName || obj.faction === this.faction) return;
		this.remove();
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
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

	remove() {
		this.active = false;
		this.deleted = true;
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.REMOVE_PROJECTILE, { name: this.name }),
		);
	}
}
