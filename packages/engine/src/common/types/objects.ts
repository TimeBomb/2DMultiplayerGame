import BaseAI from '../entities/ai/baseAI';

export enum EntityType {
	PERSON = 1,
	PROJECTILE,
	OTHER,
}

export interface GameObject {
	type: string;
	active: boolean;
	deleted?: boolean;
	name?: string;
	x: number;
	y: number;
	faction: Faction;
	sprite: string;
	entityType: EntityType;
	getBounds: () => Bounds;
	respawn?: () => void;
}

// TODO: AIGameObject and CollideableGameObject may not be right name for this
export interface AIGameObject extends GameObject {
	ai: BaseAI;
	weighTargets: (targets: CollideableGameObject[]) => void;
}

export type Bounds = {
	x: number;
	y: number;
	width: number;
	height: number;
	right: number;
	bottom: number;
};

export interface CollideableGameObject extends GameObject {
	onCollide?: (ValidGameObject: GameObject) => void;
	hitboxWidth?: number;
	hitboxHeight?: number;
	ownerName?: string;
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
	DAMAGE = 1,
	SPEED,
}
export type WeaponModifiers = {
	[key in WeaponModifier]: number;
};

export enum Faction {
	PLAYER = 1,
	ENEMY,
}
