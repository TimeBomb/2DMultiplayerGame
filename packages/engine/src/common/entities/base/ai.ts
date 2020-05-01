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

export default abstract class AI extends Person {
	aiBehaviors: BehaviorWeights;
	currentTarget: WeightedObject;
	aggroObj: AggroObject;
	aggroRange: number;

	constructor({ coordinates }: PersonProps) {
		super({ coordinates });

		this.aggroObj = new AggroObject({ owner: this, aggroRange: this.aggroRange });
		EngineState.world.addGameObject(this.aggroObj);
	}

	abstract getBehaviorRules(target: CollideableGameObject): BehaviorRule[];

	abstract updateTarget(weightedTargets: WeightedObject[]);

	setPosition(x, y) {
		this.x = x;
		this.y = y;
		// Call setPosition on the aggroObj
		this.aggroObj.setPosition(x, y);
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
