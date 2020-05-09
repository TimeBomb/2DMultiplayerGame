import { GameObject } from '../common/types/objects';
import { BehaviorWeight } from './BehaviorWeights';

export default abstract class BehaviorRule {
	name: string;
	compatibleBehaviors: BehaviorWeight[];
	behaviorWeight: BehaviorWeight;

	// Should use owner and target to come up with specific modifier to weight
	abstract run(owner: GameObject, target: GameObject): number;
}
