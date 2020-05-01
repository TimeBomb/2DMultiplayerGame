import Person, { PersonProps } from './person';
import { GameObject, CollideableGameObject } from '../../types/objects';
import {
	BehaviorWeights,
	BehaviorWeight,
	WeightedObject,
} from '../../../aibehavior/BehaviorWeights';
import AggroObject from '../../../aibehavior/AggroObject';
import BehaviorRule from '../../../aibehavior/BehaviorRule';
import EngineState from '../../../EngineState';

// TODO: Add attentionSpan to AI, only check/update collisions based on that milliseconds value
export default abstract class AI extends Person {
	aiBehaviors: BehaviorWeights;
	currentTarget: WeightedObject;
	aggroObj: AggroObject;
	aggroRange: number;
	initialized: boolean = false;

	constructor({ coordinates }: PersonProps) {
		super({ coordinates });
	}

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
		const weightedTargets: WeightedObject[] = targets.map((target) => {
			const rules = this.getBehaviorRules(target);
			const targetWeights: BehaviorWeights = {};

			rules.forEach((rule) => {
				targetWeights[rule.behaviorWeight] = targetWeights[rule.behaviorWeight] || 0;
				targetWeights[rule.behaviorWeight] += rule.run(this, target);
			});

			return { weights: targetWeights, target };
		});

		this.updateTarget(weightedTargets);
	}
}
