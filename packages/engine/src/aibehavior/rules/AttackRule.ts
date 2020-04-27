import BehaviorRule from '../BehaviorRule';
import { BehaviorWeight } from '../BehaviorWeights';
import { AIGameObject, CollideableGameObject } from '../../common/types/objects';

export default class AttackRule extends BehaviorRule {
	behaviorWeight: BehaviorWeight = BehaviorWeight.ATTACK;
	compatibleBehaviors = [BehaviorWeight.CHASE, BehaviorWeight.KITE];

	run(owner: AIGameObject, target: CollideableGameObject) {
		if (owner.faction === target.faction) return 0;
		return 1;
	}
}
