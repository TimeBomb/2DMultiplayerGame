export type ValidGameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
export type CollideableGameObject = ValidGameObject & {
	onCollide?: (ValidGameObject) => void;
	damage?: number;
	health?: number;
	isHittable?: boolean;
	owner?: string;
};
export type Rectangle = { left: number; top: number; right: number; bottom: number };
export type GameObjectBounds = Rectangle & { position: { x: number; y: number } };
