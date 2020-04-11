import { Directions } from '../constants/constants';
import Bullet from '../objects/bullet';
import { uuid } from '../lib/uuid';
import { ValidGameObject, CollideableGameObject } from '../types';

export default class Person extends Phaser.GameObjects.Sprite {
	movementDirections = new Set();
	movementSpeed = 500; // pixels per second
	health = 100;
	bullets;
	angle;
	scene;
	isHittable = true;

	constructor(scene: Phaser.Scene, x, y) {
		super(scene, x, y, 'player_handgun', undefined);
		this.setOrigin(0.5, 0.5).setDisplaySize(132, 120);
		this.bullets = scene.add.group({ classType: Bullet, runChildUpdate: true });
		scene.add.existing(this);
		this.name = uuid();
	}

	toggleMovementDirection(direction: Directions, toggleOn: boolean) {
		if (toggleOn) {
			this.movementDirections.add(direction);
		} else {
			this.movementDirections.delete(direction);
		}
	}

	updateRotation(cursor: { x: number; y: number }) {
		this.angle = Phaser.Math.Angle.BetweenPoints(this, cursor);
		this.setRotation(this.angle);
	}

	tick(game: Phaser.Game, cursor) {
		const tickRate = 1000 / game.loop.delta; // Updates per second

		if (this.movementDirections.size > 0) {
			const movementAmount = this.movementSpeed / tickRate;
			let xDiff = 0;
			let yDiff = 0;

			if (this.movementDirections.has(Directions.Forward)) yDiff -= movementAmount;
			if (this.movementDirections.has(Directions.Backward)) yDiff += movementAmount;
			if (this.movementDirections.has(Directions.Left)) xDiff -= movementAmount;
			if (this.movementDirections.has(Directions.Right)) xDiff += movementAmount;

			this.setPosition(this.x + xDiff, this.y + yDiff);
			cursor.setPosition(cursor.x + xDiff, cursor.y + yDiff);
		}
		this.updateRotation(cursor);
	}

	attack(cursor) {
		var bullet = this.bullets.get().setActive(true).setVisible(true);
		bullet.owner = this.name;

		if (bullet) {
			bullet.fire(this, cursor);
		}
	}

	onCollide(obj: CollideableGameObject) {
		if (obj.damage && obj.owner !== this.name) {
			this.health -= obj.damage;
			console.log(`was hit, ${this.name} health is now ${this.health}`);
		}
	}
}
