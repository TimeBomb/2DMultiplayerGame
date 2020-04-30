import Projectile from './projectile';

export default class Fireball extends Projectile {
	width = 10;
	height = 10;
	xSpeed = 50;
	ySpeed = 50;
	bulletLifetime = 1500;
	damage = 10;
	sprite = 'bullet';
}
