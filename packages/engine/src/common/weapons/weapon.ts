import { Coords, Size } from '../types/world';
import { WeaponModifiers, Faction } from '../types/objects';

export type AttackProps = {
	attackerCoords: Coords;
	targetCoords: Coords;
	attackerRotation: number;
	attackerSize: Size;
};
export default abstract class Weapon {
	damage: number;
	lifetimeMs: number;
	ownerName: string;
	ownerFaction: Faction;
	modifiers: WeaponModifiers;

	constructor({
		damage,
		lifetimeMs,
		ownerName,
		ownerFaction,
		modifiers,
	}: {
		damage: number;
		lifetimeMs: number;
		ownerName: string;
		ownerFaction: Faction;
		modifiers?: WeaponModifiers;
	}) {
		this.damage = damage;
		this.lifetimeMs = lifetimeMs;
		this.ownerName = ownerName;
		this.ownerFaction = ownerFaction;
		this.modifiers = modifiers;
	}

	abstract attack({ attackerCoords, targetCoords, attackerRotation, attackerSize }): void;
}
