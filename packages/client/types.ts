export type ValidGameObject = Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
export type CollideableGameObject = ValidGameObject & {
	onCollide?: (ValidGameObject) => void;
	damage?: number;
	health?: number;
	isHittable?: boolean;
	owner?: string;
};
