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
	respawnPosition: { x: number; y: number };
	isDead = false;

	constructor(scene: Phaser.Scene, x, y) {
		super(scene, x, y, 'player_handgun', undefined);
		this.respawnPosition = { x, y };
		this.setOrigin(0.5, 0.5).setDisplaySize(132, 120);
		this.bullets = scene.add.group({ classType: Bullet, runChildUpdate: true });
		scene.add.existing(this);
		this.name = uuid();
	}

	toggleMovementDirection(direction: Directions, toggleOn: boolean) {
		console.log('toggled move dirs', direction, toggleOn);
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

	// TODO: Sometimes left/right movement appears blocked after moving for some time, why?
	tick(game: Phaser.Game, cursor?) {
		const tickRate = 1000 / game.loop.delta; // Updates per second

		if (this.movementDirections.size > 0) {
			const movementAmount = this.movementSpeed / tickRate;
			let xDiff = 0;
			let yDiff = 0;

			if (this.movementDirections.has(Directions.Forward)) yDiff -= movementAmount;
			if (this.movementDirections.has(Directions.Backward)) yDiff += movementAmount;
			if (this.movementDirections.has(Directions.Left)) xDiff -= movementAmount;
			if (this.movementDirections.has(Directions.Right)) xDiff += movementAmount;

			// console.log(this.movementDirections, xDiff, yDiff);
			this.setPosition(
				Phaser.Math.Clamp(this.x + xDiff, 0, 1920),
				Phaser.Math.Clamp(this.y + yDiff, 0, 1080),
			);

			if (cursor) {
				cursor.setPosition(cursor.x + xDiff, cursor.y + yDiff);
				this.updateRotation(cursor);
			}
		}
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
		window.setTimeout(this.respawn.bind(this), 3000);
	}

	respawn() {
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
}
