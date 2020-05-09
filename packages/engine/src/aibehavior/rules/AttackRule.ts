import BehaviorRule from '../BehaviorRule';
import { BehaviorWeight } from '../BehaviorWeights';
import { AIGameObject, CollideableGameObject } from '../../common/types/objects';
import { DistanceBetweenPoints } from '../../helpers/math';

export default class AttackRule extends BehaviorRule {
	behaviorWeight: BehaviorWeight = BehaviorWeight.ATTACK;
	compatibleBehaviors = [BehaviorWeight.CHASE, BehaviorWeight.KITE];
	attackRange = 0;

	constructor(attackRange: number) {
		super();
		this.attackRange = attackRange;
	}

	run(owner: AIGameObject, target: CollideableGameObject) {
		if (owner.faction === target.faction) return 0;
		if (DistanceBetweenPoints(owner, target) <= this.attackRange) return 1;
		return 0;
	}
}
