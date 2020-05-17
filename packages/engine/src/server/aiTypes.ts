import AI from '../common/entities/base/ai';
import SimpleAI from '../common/entities/ai/simpleAI';
import { Coords } from '../common/types/world';

export const simpleEnemy = ({ x, y }: Coords) =>
	new AI(SimpleAI, { coordinates: { x, y }, maxHealth: 1000 });
