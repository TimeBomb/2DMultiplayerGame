import AI from '../base/ai';
import { WeightedObject } from '../../../aibehavior/BehaviorWeights';
import BehaviorRule from '../../../aibehavior/BehaviorRule';

export default abstract class BaseAI {
	ai: AI;

	constructor(ai: AI) {
		this.ai = ai;
	}

	abstract aiUpdate();

	abstract updateTarget(targetObjects: WeightedObject[]);

	abstract getBehaviorRules(): BehaviorRule[];
}

export type IBaseAI = new (ai: AI) => BaseAI;
