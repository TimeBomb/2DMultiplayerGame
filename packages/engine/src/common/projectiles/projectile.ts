import { Uuid } from '../../helpers/misc';
import EngineState from '../../EngineState';
import { CollideableGameObject, WeaponModifiers, EntityType, Faction } from '../types/objects';
import { GameEvent, EventType } from '../types/events';

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
		if (this.born > this.bulletLifetime) {
			this.active = false;
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
		if (!obj.isHittable || obj.name === this.ownerName || this.faction === this.faction) return;
		this.active = false;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}

	getBounds() {
		return {
			top: this.x,
			left: this.y,
			bottom: this.y + this.height,
			right: this.x + this.width,
		};
	}

	setActive(active: boolean) {
		this.active = active;
	}
}
