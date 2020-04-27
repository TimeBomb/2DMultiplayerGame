import { WeightedObject } from '../../aibehavior/BehaviorWeights';

export interface GameObject {
	type: string;
	active: boolean;
	name?: string;
	x: number;
	y: number;
	faction: Faction;
	getBounds: () => Bounds;
	respawn?: () => void;
}

// TODO: CollideableGameObject may not be right name for this
export interface AIGameObject extends GameObject {
	updateTarget: (weightedTargets: WeightedObject[]) => void;
	weighTargets: (targets: CollideableGameObject[]) => void;
}

export type Bounds = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

export interface CollideableGameObject extends GameObject {
	onCollide?: (ValidGameObject: GameObject) => void;
	damage?: number;
	health?: number;
	isHittable?: boolean;
	owner?: GameObject;
	isAggroObject?: boolean;
}

// TODO: Probably better name for this, too similar to AggroObject
// This is a type because it doesn't just extend CollideableGameObject, it overrides one of its properties (onCollide)
export type AggroGameObject = CollideableGameObject & {
	setPosition: (x: number, y: number) => void;
	onCollide: (gameObjs: CollideableGameObject[]) => void;
	width: number;
	height: number;
	radius: number;
};
export type Rectangle = { left: number; top: number; right: number; bottom: number };

export enum WeaponModifier {
	damage = 1,
	speed,
}
export type WeaponModifiers = {
	[key in WeaponModifier]: number;
};

export enum Faction {
	PLAYER = 1,
	ENEMY,
}
