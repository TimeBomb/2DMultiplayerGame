import Person, { PersonProps } from '../base/person';
import { Faction } from '../../types/objects';
import FireStaff from '../../weapons/firestaff';
import { AngleBetweenPoints } from '../../../helpers/math';

// TODO: Hold left click to attack, have attack speed
export default class Shooter extends Person {
	movementSpeed = 55;
	health = 10000; // TODO: Lower health
	width = 32;
	height = 32;
	hitboxWidth = 40;
	hitboxHeight = 40;
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

	// TODO: May want to move this logic to generic Person class
	update({ xDiff, yDiff }) {
		if (this.targetCoords) {
			this.targetCoords.x += xDiff;
			this.targetCoords.y += yDiff;
			this.rotation = AngleBetweenPoints(this, this.targetCoords);
		}
	}
}
