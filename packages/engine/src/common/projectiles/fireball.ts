import Projectile from './projectile';

export default class Fireball extends Projectile {
	width = 10;
	height = 10;
	xSpeed = 3000;
	ySpeed = 3000;
	bulletLifetime = 400;
	damage = 10;
	sprite = 'bullet';
}
