import EngineState from '../../../EngineState';
import { CollideableGameObject, WeaponModifiers, EntityType, Faction } from '../../types/objects';
import { GameEvent, EventType } from '../../types/events';
import { Coords } from '../../types/world';
import { ProjectileType } from '../../projectileTypes';
import { nanoid } from 'nanoid';

export type EngineProjectileProps = {
	ownerName: string;
	ownerFaction: Faction;
	modifiers?: WeaponModifiers;
	attackerCoords: Coords;
	targetCoords: Coords;
	attackerSize: { width: number; height: number };
	born?: number;
	name?: string;
};
type ProjectileTypeProps = {
	width: number;
	height: number;
	xSpeed: number;
	ySpeed: number;
	bulletLifetime: number;
	damage: number;
	sprite: string;
};

type ProjectileProps = EngineProjectileProps & ProjectileTypeProps;

export default class Projectile {
	x = 0;
	y = 0;
	width = 0;
	height = 0;
	name: string;
	direction: number;
	xSpeed = 0;
	ySpeed = 0;
	bulletLifetime = 0;
	damage = 0;
	born = 0;
	ownerName: string; // Identifier of the person that shot this bullet
	faction: Faction;
	active = true;
	modifiers: WeaponModifiers;
	entityType: EntityType = EntityType.PROJECTILE;
	type = 'Image';
	deleted = false;
	attackerCoords: Coords;
	attackerSize: { width: number; height: number };
	targetCoords: Coords;
	sprite: string;
	projectileType: ProjectileType;

	constructor(
		projectileType: ProjectileType,
		{
			name,
			ownerName,
			ownerFaction,
			modifiers,
			attackerCoords,
			targetCoords,
			attackerSize,
			width,
			height,
			xSpeed,
			ySpeed,
			bulletLifetime,
			damage,
			sprite,
			born,
		}: ProjectileProps,
	) {
		this.projectileType = projectileType;
		this.name = name || nanoid();
		this.ownerName = ownerName;
		this.faction = ownerFaction;
		this.modifiers = modifiers;
		this.attackerCoords = attackerCoords;
		this.targetCoords = targetCoords;
		this.attackerSize = attackerSize;
		this.width = width;
		this.height = height;
		this.xSpeed = xSpeed;
		this.ySpeed = ySpeed;
		this.bulletLifetime = bulletLifetime;
		this.damage = damage;
		this.sprite = sprite;

		if (typeof this.born !== 'undefined') this.born = born;

		EngineState.eventBus.listen(EventType.ENGINE_TICK, this.tick.bind(this));
	}

	initialize() {
		let xMod = 0;
		let yMod = 0;
		const yDiff = this.attackerCoords.y - this.targetCoords.y;
		const xDiff = this.attackerCoords.x - this.targetCoords.x;

		// This logic tries to make the bullet appear appropriately in front of the player
		// It's close to accurate but not perfect, may need to tinker more with it
		// Likely need to incorporate the size of the bullet somewhere
		if (xDiff > 0) xMod -= Math.max(xDiff / 100, this.attackerSize.width / 2);
		if (xDiff < 0) xMod += Math.max(xDiff / 100, this.attackerSize.width / 2);
		if (yDiff > 0) yMod -= Math.max(yDiff / 100, this.attackerSize.height / 2);
		if (yDiff < 0) yMod += Math.max(yDiff / 100, this.attackerSize.height / 2);

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
				new GameEvent(EventType.ENGINE_UPDATE_PROJECTILE, {
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
			new GameEvent(EventType.ENGINE_REMOVE_PROJECTILE, { name: this.name }),
		);
	}
}
