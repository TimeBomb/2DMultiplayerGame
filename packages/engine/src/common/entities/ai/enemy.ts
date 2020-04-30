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
import MoveRule from '../../../aibehavior/rules/MoveRule';
import EngineState from '../../../EngineState';

export interface EnemyProps {
	coordinates: Coords;
}

// TODO: Enemy not dying for some reason - check person onCollide
export default class Enemy extends AI {
	movementSpeed = 20;
	health = 100;
	width = 32;
	height = 32;
	hitboxWidth = 50;
	hitboxHeight = 50;
	faction = Faction.ENEMY;
	sprite = 'player';
	weapon;

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
		EngineState.world.addGameObject(this.aggroObj);
	}

	update({ xDiff, yDiff }: { xDiff: number; yDiff: number }) {
		if (this.currentTarget) {
			this.updateTargetCoords(this.currentTarget.target.x, this.currentTarget.target.y);

			const seed = Math.random();
			// If we are supposed to attack, 5% chance to attack per tick
			if (seed <= this.currentTarget.weights[BehaviorWeight.ATTACK] && seed <= 0.05) {
				this.attack();
			}

			if (seed <= this.currentTarget.weights[BehaviorWeight.CHASE]) {
				const seed = Math.random();
				if (seed > 0.98) {
					this.toggleMovementDirection(Directions.Backward, true);
					this.toggleMovementDirection(Directions.Forward, false);
				} else if (seed > 0.96) {
					this.toggleMovementDirection(Directions.Forward, true);
					this.toggleMovementDirection(Directions.Backward, false);
				} else if (seed > 0.94) {
					this.toggleMovementDirection(Directions.Left, true);
					this.toggleMovementDirection(Directions.Right, false);
				} else if (seed > 0.92) {
					this.toggleMovementDirection(Directions.Right, true);
					this.toggleMovementDirection(Directions.Left, false);
				}
			}
		}
	}

	// TODO Eventually improve AI
	updateTarget(targetObjects: WeightedObject[]) {
		if (!targetObjects.length) {
			this.currentTarget = null;
			return;
		}

		this.currentTarget = targetObjects[0];
	}

	getBehaviorRules(): BehaviorRule[] {
		return [new AttackRule(), new MoveRule()];
	}
}
