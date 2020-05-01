import { Directions } from '../../../helpers/constants';
import { Faction } from '../../types/objects';
import AI from '../base/ai';
import { Coords } from '../../types/world';
import AttackRule from '../../../aibehavior/rules/AttackRule';
import BehaviorRule from '../../../aibehavior/BehaviorRule';
import { WeightedObject, BehaviorWeight } from '../../../aibehavior/BehaviorWeights';
import MoveRule from '../../../aibehavior/rules/MoveRule';
import EngineState from '../../../EngineState';
import Fireball from '../../projectiles/fireball';
import { PersonProps } from '../base/person';

export interface EnemyProps {
	coordinates: Coords;
}

export default class Enemy extends AI {
	movementSpeed = 20;
	initialHealth = 100;
	width = 32;
	height = 32;
	hitboxWidth = 60;
	hitboxHeight = 60;
	faction = Faction.ENEMY;
	sprite = 'player';
	weapon = Fireball;
	aggroRange = 500;

	constructor({ coordinates }: PersonProps) {
		super({ coordinates });
		this.health = this.initialHealth;
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
