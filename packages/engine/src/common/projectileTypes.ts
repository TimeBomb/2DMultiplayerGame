import Projectile, { EngineProjectileProps } from './entities/base/projectile';

export enum ProjectileType {
	Fireball = 1,
}

export default {
	[ProjectileType.Fireball]: (options: EngineProjectileProps): Projectile => {
		return new Projectile(ProjectileType.Fireball, {
			...options,
			width: 10,
			height: 10,
			xSpeed: 2,
			ySpeed: 2,
			bulletLifetime: 1000,
			damage: 10,
			sprite: 'bullet',
		});
	},
};
