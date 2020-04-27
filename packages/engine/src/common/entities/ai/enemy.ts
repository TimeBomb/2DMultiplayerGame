import { Directions } from '../../../helpers/constants';
import { Faction, AggroGameObject, CollideableGameObject } from '../../types/objects';
import AI from '../base/ai';
import { Coords } from '../../types/world';
import Weapon from '../../weapons/weapon';
import FireStaff from '../../weapons/firestaff';
import AggroObject from '../../../aibehavior/AggroObject';
import AttackRule from '../../../aibehavior/rules/AttackRule';
import BehaviorRule from '../../../aibehavior/BehaviorRule';
import { WeightedObject, BehaviorWeight } from '../../../aibehavior/BehaviorWeights';

export interface EnemyProps {
	coordinates: Coords;
}

export default class Enemy extends AI {
	movementSpeed = 55;
	health = 100;
	width: 32;
	height: 32;
	faction = Faction.ENEMY;

	constructor({ coordinates }: EnemyProps) {
		super({
			coordinates,
		});

		this.weapon = new FireStaff({
			damage: 10,
			lifetimeMs: 1500,
			ownerName: this.name,
			ownerFaction: this.faction,
		});

		this.aggroObj = new AggroObject({ owner: this, aggroRange: 500 });
	}

	update() {
		const seed = Math.random();
		if (seed <= this.currentTarget.weights[BehaviorWeight.ATTACK]) {
			this.attack();
		}
	}

	// TODO Eventually improve AI
	updateTarget(targetObjects: WeightedObject[]) {
		return targetObjects[0];
	}

	getBehaviorRules(): BehaviorRule[] {
		return [new AttackRule()];
	}
}
