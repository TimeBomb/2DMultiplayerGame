import Enemy from '../common/entities/ai/enemy';
import Shooter from '../common/entities/player/shooter';
import Fireball from '../common/projectiles/fireball';
import Timestep from '../common/utils/timestep';
import FireStaff from '../common/weapons/firestaff';
import World from '../common/world';

export enum GameObjects {
	ENEMY = 1,
	SHOOTER,
	FIREBALL,
	TIMESTEP,
	FIRESTAFF,
	WORLD
}
const GameObjectsClasses = {
	[GameObjects.ENEMY]: Enemy,
	[GameObjects.SHOOTER]: Shooter,
	[GameObjects.FIREBALL]: Fireball,
	[GameObjects.TIMESTEP]: Timestep,
	[GameObjects.FIRESTAFF]: FireStaff,
	[GameObjects.WORLD]: World,
};

type ValueOf<T> = T[keyof T];
const GameObjectsClassMap: { [K in GameObjects]?: ValueOf<typeof GameObjectsClasses> } = GameObjectsClasses;

export default class ClientFactory {
	create<K extends GameObjects>(
		name: K,
		...options: ConstructorParameters<typeof GameObjectsClasses[K]>
	): typeof GameObjectsClasses[K] {
		return GameObjectsClassMap[name].constructor.apply(undefined, options);
}