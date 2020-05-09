import Person, { PersonProps } from './person';
import { CollideableGameObject } from '../../types/objects';
import { BehaviorWeights, WeightedObject } from '../../../aibehavior/BehaviorWeights';
import AggroObject from '../../../aibehavior/AggroObject';
import BehaviorRule from '../../../aibehavior/BehaviorRule';
import EngineState from '../../../EngineState';

export default abstract class AI extends Person {
	aiBehaviors: BehaviorWeights;
	currentTarget: WeightedObject;
	aggroObj: AggroObject;
	aggroRange: number;
	initialized: boolean = false;
	attentionSpan: number = 0;
	currentAttentionSpan: number = 0;

	abstract aiUpdate({ xDiff, yDiff });

	initialize() {
		this.aggroObj = new AggroObject({
			owner: this,
			aggroRange: this.aggroRange,
			maxAggroRange: this.aggroRange * 2,
		});
		EngineState.world.addGameObject(this.aggroObj);
		this.initialized = true;
	}

	update({ xDiff, yDiff }) {
		if (!this.initialized) this.initialize();

		// If no target, we can trigger attention span recheck immediately
		if (!this.currentTarget) this.currentAttentionSpan = this.attentionSpan;

		// Increase current attention span.
		if (this.currentAttentionSpan < this.attentionSpan) {
			this.currentAttentionSpan += EngineState.timeStep.frameTimeMS;
		}

		this.aiUpdate({ xDiff, yDiff });
	}

	abstract getBehaviorRules(target: CollideableGameObject): BehaviorRule[];

	abstract updateTarget(weightedTargets: WeightedObject[]);

	setPosition(x, y) {
		this.x = x;
		this.y = y;
		// Call setPosition on the aggroObj
		this.aggroObj.x = x;
		this.aggroObj.y = y;
	}

	weighTargets(targets: CollideableGameObject[]) {
		// Only recheck targets if attention span recheck is initiated
		if (this.currentAttentionSpan >= this.attentionSpan) {
			this.currentAttentionSpan = 0;
			const weightedTargets: WeightedObject[] = targets.map((target) => {
				const rules = this.getBehaviorRules(target);
				const targetWeights: BehaviorWeights = {};

				rules.forEach((rule) => {
					targetWeights[rule.behaviorWeight] = targetWeights[rule.behaviorWeight] || 0;
					targetWeights[rule.behaviorWeight] += rule.run(this, target);
				});

				return { weights: targetWeights, target };
			});

			// Remove current target if no targets in aggro range
			// If targets, update current target based on weights
			if (!weightedTargets.length) {
				this.currentTarget = null;
			} else {
				this.updateTarget(weightedTargets);
			}
		}
	}
}
