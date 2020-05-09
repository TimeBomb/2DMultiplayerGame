import Projectile from './projectile';

export default class Fireball extends Projectile {
	width = 10;
	height = 10;
	xSpeed = 2;
	ySpeed = 2;
	bulletLifetime = 1000;
	damage = 10;
	sprite = 'bullet';
}
