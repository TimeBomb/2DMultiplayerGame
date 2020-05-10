import { Directions } from '../../../helpers/constants';
import { Faction } from '../../types/objects';
import AI from '../base/ai';
import { Coords } from '../../types/world';
import AttackRule from '../../../aibehavior/rules/AttackRule';
import BehaviorRule from '../../../aibehavior/BehaviorRule';
import { WeightedObject, BehaviorWeight } from '../../../aibehavior/BehaviorWeights';
import MoveRule from '../../../aibehavior/rules/MoveRule';
import Fireball from '../../projectiles/fireball';
import { PersonProps } from '../base/person';

export interface EnemyProps {
	coordinates: Coords;
}

// TODO: Enemies and players need to be updated. One single generic enemy and one player class.
// And individual classes for different types of AI that can be passed to the Enemy class.
// And the classes should accept appropriate arguments like size, location, sprite, etc.
// Figure out how to structure stats and skills for these entities.

// TODO: Individual shapes in certain parts of the map should be fixed in position and tied to AI.
// TODO: After X seconds, move back to original spawn location instead of just stopping movement
// These map-specific shape objects should not allow the AI to move outside of them, even via aggro
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
	aggroRange = 900;
	attentionSpan = 1000;

	constructor(args: PersonProps) {
		super(args);
		this.health = this.initialHealth;
	}

	aiUpdate({ xDiff, yDiff }: { xDiff: number; yDiff: number }) {
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
		} else {
			// TODO: After X seconds, move back to original spawn location instead of just stopping movement
			this.stopMovement();
		}
	}

	// TODO Eventually improve AI
	updateTarget(targetObjects: WeightedObject[]) {
		this.currentTarget = targetObjects[0];
	}

	// TODO: Create chase and run away rules
	getBehaviorRules(): BehaviorRule[] {
		return [new MoveRule(), new AttackRule(this.aggroRange * 0.6)];
	}
}
