import { Directions } from '../../../helpers/constants';
import AttackRule from '../../../aibehavior/rules/AttackRule';
import BehaviorRule from '../../../aibehavior/BehaviorRule';
import { WeightedObject, BehaviorWeight } from '../../../aibehavior/BehaviorWeights';
import MoveRule from '../../../aibehavior/rules/MoveRule';
import BaseAI from './baseAI';

// TODO: Individual shapes in certain parts of the map should be fixed in position and tied to ai
// TODO: After X seconds, move back to original spawn location instead of just stopping movement
// These map-specific shape objects should not allow the AI to move outside of them, even via aggro
export default class SimpleAI extends BaseAI {
	aiUpdate() {
		if (this.ai.currentTarget) {
			if (this.ai.currentTarget.target.health === 0) {
				this.ai.currentTarget = null;
				return;
			}

			this.ai.handlePointerMove({
				x: this.ai.currentTarget.target.x,
				y: this.ai.currentTarget.target.y,
			});

			const seed = Math.random();
			// If we are supposed to attack, 5% chance to attack per tick
			if (seed <= this.ai.currentTarget.weights[BehaviorWeight.ATTACK]) {
				seed > 0.9 ? this.ai.handleMouseDown() : this.ai.handleMouseUp();
			}

			if (seed <= this.ai.currentTarget.weights[BehaviorWeight.CHASE]) {
				const seed = Math.random();
				if (seed > 0.98) {
					this.ai.handleMove(Directions.Backward, true);
					this.ai.handleMove(Directions.Forward, false);
				} else if (seed > 0.96) {
					this.ai.handleMove(Directions.Forward, true);
					this.ai.handleMove(Directions.Backward, false);
				} else if (seed > 0.94) {
					this.ai.handleMove(Directions.Left, true);
					this.ai.handleMove(Directions.Right, false);
				} else if (seed > 0.92) {
					this.ai.handleMove(Directions.Right, true);
					this.ai.handleMove(Directions.Left, false);
				}
			}
		} else {
			// TODO: After X seconds, move back to original spawn location instead of just stopping movement
			this.ai.handleStopMovement();
		}
	}

	updateTarget(targetObjects: WeightedObject[]) {
		this.ai.currentTarget = targetObjects[0];
	}

	// TODO: Create chase and run away rules
	getBehaviorRules(): BehaviorRule[] {
		return [new MoveRule(), new AttackRule(this.ai.aggroRange * 0.6)];
	}
}
