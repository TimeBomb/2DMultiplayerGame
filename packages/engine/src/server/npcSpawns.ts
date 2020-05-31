import aiTypes, { AIType } from '../common/aiTypes';
import { Coords } from '../common/types/world';

type EnemySpawn = { type: keyof typeof aiTypes; options: Coords };
export const spawns: EnemySpawn[] = [{ type: AIType.SimpleEnemy, options: { x: 800, y: 1000 } }];
