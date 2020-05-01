import Projectile from './projectile';

export default class Fireball extends Projectile {
	width = 10;
	height = 10;
	xSpeed = 1;
	ySpeed = 1;
	bulletLifetime = 1000;
	damage = 10;
	sprite = 'bullet';
}
