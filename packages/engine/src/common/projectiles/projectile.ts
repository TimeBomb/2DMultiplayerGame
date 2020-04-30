import { Uuid } from '../../helpers/misc';
import EngineState from '../../EngineState';
import { CollideableGameObject, WeaponModifiers, EntityType, Faction } from '../types/objects';
import { GameEvent, EventType } from '../types/events';

// TODO: Consolidate logic for removing projectile so it's not repetitive
export default abstract class Projectile {
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
	rotation: number = 0;
	born: number = 0;
	ownerName: string; // Identifier of the person that shot this bullet
	faction: Faction;
	active: boolean = true;
	modifiers: WeaponModifiers;
	entityType: EntityType = EntityType.PROJECTILE;
	type: string = 'Image';
	deleted: boolean = false;
	abstract sprite: string;

	constructor({
		ownerName,
		ownerFaction,
		modifiers,
	}: {
		ownerName: string;
		ownerFaction: Faction;
		modifiers?: WeaponModifiers;
	}) {
		this.name = Uuid();
		this.ownerName = ownerName;
		this.faction = ownerFaction;
		this.modifiers = modifiers;

		EngineState.eventBus.listen(EventType.TICK, this.tick.bind(this));
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
			this.active = false;
			this.deleted = true;
			EngineState.eventBus.dispatch(
				new GameEvent(EventType.REMOVE_PROJECTILE, { name: this.name }),
			);
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
		this.active = false;
		this.deleted = true;
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.REMOVE_PROJECTILE, { name: this.name }),
		);
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
}
