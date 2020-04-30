import { Directions } from '../constants/constants';
import Bullet from '../objects/bullet';
import { uuid } from '../lib/uuid';
import { CollideableGameObject, Rectangle } from '../types';
import World from '../World';

export default class Person extends Phaser.GameObjects.Sprite {
	movementDirections = new Set();
	movementSpeed = 55;
	health = 100;
	respawnTime = 3000;
	bullets;
	angle;
	scene;
	isHittable = true;
	respawnPosition: { x: number; y: number };
	isDead = false;
	world: World;
	movementIntervals: [200, 400, 600, 800, 1000];

	constructor(scene: Phaser.Scene, x, y, world) {
		super(scene, x, y, 'player', undefined);
		this.world = world;
		this.respawnPosition = { x, y };
		this.setScale(1.5, 1.5);
		this.bullets = scene.add.group({ classType: Bullet, runChildUpdate: true });
		scene.add.existing(this);
		this.name = uuid();
	}

	toggleMovementDirection(direction: Directions, toggleOn: boolean) {
		if (this.isDead) return;

		if (toggleOn) {
			this.movementDirections.add(direction);
		} else {
			this.movementDirections.delete(direction);
		}
	}

	stopMovement() {
		this.movementDirections.clear();
	}

	updateRotation(cursor: { x: number; y: number }) {
		this.angle = Phaser.Math.Angle.BetweenPoints(this, cursor);
		this.setRotation(this.angle);
	}

	tick(game: Phaser.Game, frameTimeMs: number, cursor?) {
		let xDiff = 0;
		let yDiff = 0;

		if (this.movementDirections.size > 0) {
			const movementAmount = Math.floor((this.movementSpeed * frameTimeMs) / 100);
			const MOVEMENT_STEPS = 8;

			const splitMovementAmount = Math.floor(movementAmount / MOVEMENT_STEPS);
			for (let i = 0; i < splitMovementAmount + 1; i++) {
				// If last movement, get remainder of movement steps left after splitting into intervals of MOVEMENT_STEPS
				const movementSteps =
					i === splitMovementAmount ? movementAmount % MOVEMENT_STEPS : MOVEMENT_STEPS;
				if (movementSteps === 0) break;

				const { xDiff: newXDiff, yDiff: newYDiff } = this.validateMove(
					movementSteps,
					xDiff,
					yDiff,
				);
				xDiff = newXDiff;
				yDiff = newYDiff;
			}

			this.move(xDiff, yDiff);
		}

		if (cursor) {
			cursor.setPosition(cursor.x + xDiff, cursor.y + yDiff);
			this.updateRotation(cursor);
		}
	}

	validateMove(movementAmount, initialXDiff: number, initialYDiff: number) {
		if (movementAmount === 0) return;

		let xDiff = initialXDiff;
		let yDiff = initialYDiff;
		if (this.movementDirections.has(Directions.Forward)) yDiff -= movementAmount;
		if (this.movementDirections.has(Directions.Backward)) yDiff += movementAmount;
		if (this.movementDirections.has(Directions.Left)) xDiff -= movementAmount;
		if (this.movementDirections.has(Directions.Right)) xDiff += movementAmount;

		// TODO: Uncomment to reenable [buggy] world collision
		if (this.hasWorldCollision(this.x + xDiff, this.y)) {
			xDiff = initialXDiff;
		}
		if (this.hasWorldCollision(this.x, this.y + yDiff)) {
			yDiff = initialYDiff;
		}

		return { xDiff, yDiff };
	}

	move(xDiff: number, yDiff: number) {
		this.setPosition(
			Phaser.Math.Clamp(this.x + xDiff, 0, 3200),
			Phaser.Math.Clamp(this.y + yDiff, 0, 3200),
		);
	}

	attack(cursor) {
		if (this.isDead) return;

		var bullet = this.bullets.get().setActive(true).setVisible(true);
		bullet.owner = this.name;

		if (bullet) {
			bullet.fire(this, cursor);
		}
	}

	onDead() {
		// TODO: Respawn from server
		this.isDead = true;
		this.stopMovement();
		this.setActive(false).setVisible(false);
	}

	respawn() {
		if (!this.isDead) return;

		this.health = 100;
		this.isDead = false;
		this.setPosition(this.respawnPosition.x, this.respawnPosition.y)
			.setVisible(true)
			.setActive(true);
	}

	onCollide(obj: CollideableGameObject) {
		if (obj.damage && obj.owner !== this.name) {
			this.health -= obj.damage;
			if (this.health <= 0) {
				this.health = 0;
				this.onDead();
			}
		}
	}

	hasWorldCollision(x, y) {
		// Sprite needs to be at least size of tile width/height otherwise certain collision can bug
		// Add padding on all sides to help avoid edge cases where collision can bug on corners
		// TODO: Sometimes it's possible to collide and get stuck on corners
		// If can't reproduce after 5 mins, just get engine set up and then spin up several NPCs
		// and see if they can reproduce it after several minutes
		// though maybe switching movementSteps from 5 to 8 fixed it
		const spritePaddingY = 0;
		const spritePaddingX = 0;
		const objRect: Rectangle = {
			bottom: y + this.height + spritePaddingY,
			right: x + this.width + spritePaddingX,
			top: y - spritePaddingY,
			left: x - spritePaddingX,
		};

		// console.log(x, y, objRect);

		const hasCollided = this.world.checkWorldCollision(objRect);
		return hasCollided;
	}
}
