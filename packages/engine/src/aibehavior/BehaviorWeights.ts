import { CollideableGameObject } from '../common/types/objects';

export enum BehaviorWeight {
	ATTACK = 1,
	CHASE,
	RUN_AWAY,
	KITE,
}

export type BehaviorWeights = {
	[K in BehaviorWeight]?: number;
};

export type WeightedObject = { weights: BehaviorWeights; target: CollideableGameObject };
