import Weapon, { AttackProps } from './weapon';
import Fireball from '../projectiles/fireball';

export default class FireStaff extends Weapon {
	projectileSpeed: number = 1.5;
	damage: number = 10;
	lifetimeMs: number = 1000;

	attack({ attackerCoords, targetCoords, attackerRotation, attackerSize }: AttackProps) {
		const projectile = new Fireball({
			ownerName: this.ownerName,
			ownerFaction: this.ownerFaction,
		});
		let xMod = 0;
		let yMod = 0;
		const yDiff = attackerCoords.y - targetCoords.y;
		const xDiff = attackerCoords.x - targetCoords.x;

		// This logic tries to make the bullet appear appropriately in front of the player
		// It's close to accurate but not perfect, may need to tinker more with it
		// Likely need to incorporate the size of the bullet somewhere
		const gameWidth = 800;
		const gameHeight = 600;
		const widthDivider = gameWidth / attackerSize.width;
		const heightDivider = gameHeight / attackerSize.height;
		if (xDiff > 0) xMod -= Math.max(xDiff / widthDivider, attackerSize.width / 2);
		if (xDiff < 0) xMod += Math.max(xDiff / widthDivider, attackerSize.width / 2);
		if (yDiff > 0) yMod -= Math.max(yDiff / heightDivider, attackerSize.height / 2);
		if (yDiff < 0) yMod += Math.max(yDiff / heightDivider, attackerSize.height / 2);

		projectile.setPosition(attackerCoords.x + xMod, attackerCoords.y + yMod); // Initial position
		projectile.direction = Math.atan(
			(targetCoords.x - projectile.x) / (targetCoords.y - projectile.y),
		);

		// Calculate X and y velocity of bullet to moves it from attackerCoords to target
		if (targetCoords.y >= projectile.y) {
			projectile.xSpeed = this.projectileSpeed * Math.sin(projectile.direction);
			projectile.ySpeed = this.projectileSpeed * Math.cos(projectile.direction);
		} else {
			projectile.xSpeed = -this.projectileSpeed * Math.sin(projectile.direction);
			projectile.ySpeed = -this.projectileSpeed * Math.cos(projectile.direction);
		}

		projectile.rotation = attackerRotation; // angle bullet with shooters rotation
	}
}
