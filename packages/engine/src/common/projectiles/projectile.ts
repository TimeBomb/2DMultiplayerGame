import { Uuid } from '../../helpers/misc';
import EngineState from '../../EngineState';
import { CollideableGameObject, WeaponModifiers, WeaponModifier, Faction } from '../types/objects';

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
	rotation: number = 0;
	born: number = 0;
	ownerName: string; // Identifier of the person that shot this bullet
	ownerFaction: Faction;
	active: boolean = true;
	modifiers: WeaponModifiers;
	type: string = 'Image';

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
		this.ownerFaction = ownerFaction;
		this.modifiers = modifiers;
	}

	tick() {
		this.x += this.xSpeed * EngineState.timeStep.frameTimeMS;
		this.y += this.ySpeed * EngineState.timeStep.frameTimeMS;
		this.born += EngineState.timeStep.frameTimeMS;
		if (this.born > this.bulletLifetime) {
			this.active = false;
		}
	}

	onCollide(obj: CollideableGameObject) {
		// If can't collide with object, or object is owner of this bullet, don't trigger collision
		if (
			!obj.isHittable ||
			obj.name === this.ownerName ||
			this.ownerFaction === this.ownerFaction
		)
			return;
		this.active = false;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}
}
