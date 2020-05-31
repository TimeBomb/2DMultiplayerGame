import AI from './entities/base/ai';
import SimpleAI from './entities/ai/simpleAI';
import { Directions } from '../helpers/constants';

export enum AIType {
	SimpleEnemy = 1,
}

type AIProps = {
	x: number;
	y: number;
	health?: number;
	movementDirections?: Set<Directions>;
	rotation?: number;
};

export default {
	[AIType.SimpleEnemy]: ({ x, y, health, movementDirections, rotation }: AIProps) => {
		return new AI(AIType.SimpleEnemy, SimpleAI, {
			coordinates: { x, y },
			maxHealth: 1000,
			health,
			movementDirections: new Set(movementDirections || []),
			rotation,
		});
	},
};
