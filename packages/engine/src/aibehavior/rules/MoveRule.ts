import BehaviorRule from '../BehaviorRule';
import { BehaviorWeight } from '../BehaviorWeights';
import { AIGameObject, CollideableGameObject } from '../../common/types/objects';

// TODO: Change this to some other rule, like Chase or RunAway
export default class MoveRule extends BehaviorRule {
	behaviorWeight: BehaviorWeight = BehaviorWeight.CHASE;
	compatibleBehaviors = [BehaviorWeight.ATTACK];

	run(owner: AIGameObject, target: CollideableGameObject) {
		// if (owner.faction === target.faction) return 0;
		return 1;
	}
}
