import Person, { PersonProps } from '../base/person';
import { Faction } from '../../types/objects';
import FireStaff from '../../weapons/firestaff';

export default class Shooter extends Person {
	movementSpeed = 55;
	health = 100;
	width = 32;
	height = 32;
	faction = Faction.PLAYER;
	sprite = 'player';
	weapon;

	constructor({ coordinates }: PersonProps) {
		super({ coordinates });
		this.weapon = new FireStaff({
			damage: 10,
			lifetimeMs: 1500,
			ownerName: this.name,
			ownerFaction: this.faction,
		});
	}

	update({ xDiff, yDiff }) {}
}
