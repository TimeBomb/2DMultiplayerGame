import { simpleEnemy } from './aiTypes';
import { Coords } from '../common/types/world';
import AI from '../common/entities/base/ai';

type EnemySpawn = { type: ({ x, y }: Coords) => AI; options: Coords };
export const spawns: EnemySpawn[] = [{ type: simpleEnemy, options: { x: 800, y: 1000 } }];
