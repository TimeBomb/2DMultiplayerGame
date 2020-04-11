import Person from '../entities/person';
import { Directions } from '../constants/constants';
import { uuid } from '../lib/uuid';
import { CollideableGameObject } from '../types';

export default class Bullet extends Phaser.GameObjects.Image {
	speed: number;
	born: number;
	direction: number;
	xSpeed: number;
	ySpeed: number;
	bulletLifetime: number;
	damage: number;
	owner: string; // Name of the person that shot this bullet

	constructor(scene, owner) {
		super(scene, 0, 0, 'bullet');
		this.name = uuid();
		this.speed = 1.2;
		this.born = 0;
		this.direction = 0;
		this.xSpeed = 0;
		this.ySpeed = 0;
		this.bulletLifetime = 1800;
		this.damage = 10;
		this.owner = owner;
		this.setSize(20, 20);
	}

	// Fires a bullet from the player to the reticle
	// TODO: Add collider with enemy, on collide do damage
	fire(shooter: Phaser.GameObjects.Sprite, target) {
		let xMod = 0;
		let yMod = 0;
		const yDiff = shooter.y - target.y;
		const xDiff = shooter.x - target.x;

		// This logic tries to make the bullet appear appropriately in front of the player
		// It's close to accurate but not perfect, may need to tinker more with it
		// Likely need to incorporate the size of the bullet somewhere
		const gameWidth = 800;
		const gameHeight = 600;
		const widthDivider = gameWidth / shooter.width;
		const heightDivider = gameHeight / shooter.height;
		if (xDiff > 0) xMod -= Math.max(xDiff / widthDivider, shooter.width / 2);
		if (xDiff < 0) xMod += Math.max(xDiff / widthDivider, shooter.width / 2);
		if (yDiff > 0) yMod -= Math.max(yDiff / heightDivider, shooter.height / 2);
		if (yDiff < 0) yMod += Math.max(yDiff / heightDivider, shooter.height / 2);

		this.setPosition(shooter.x + xMod, shooter.y + yMod); // Initial position
		this.direction = Math.atan((target.x - this.x) / (target.y - this.y));

		// Calculate X and y velocity of bullet to moves it from shooter to target
		if (target.y >= this.y) {
			this.xSpeed = this.speed * Math.sin(this.direction);
			this.ySpeed = this.speed * Math.cos(this.direction);
		} else {
			this.xSpeed = -this.speed * Math.sin(this.direction);
			this.ySpeed = -this.speed * Math.cos(this.direction);
		}

		this.rotation = shooter.rotation; // angle bullet with shooters rotation
		this.born = 0; // Time since new bullet spawned
	}

	update(time, delta) {
		this.x += this.xSpeed * delta;
		this.y += this.ySpeed * delta;
		this.born += delta;
		if (this.born > this.bulletLifetime) {
			this.setActive(false);
			this.setVisible(false);
		}
	}

	onCollide(obj: CollideableGameObject) {
		// If can't collide with object, or object is owner of this bullet, don't trigger collision
		if (!obj.isHittable || obj.name === this.owner) return;
		this.setActive(false);
		this.setVisible(false);
	}
}
