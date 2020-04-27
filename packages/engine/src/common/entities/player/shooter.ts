import Person from '../base/person';
import { Faction } from '../../types/objects';

export default class Shooter extends Person {
	movementSpeed = 55;
	health = 100;
	width: 32;
	height: 32;
	faction = Faction.PLAYER;

	update({ xDiff, yDiff }) {}
}
