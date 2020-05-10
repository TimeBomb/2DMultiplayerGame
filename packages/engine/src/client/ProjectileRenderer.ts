import EngineState from '../EngineState';
import { EventType } from '../common/types/events';
import { EntityType } from '../common/types/objects';
import { GameObjects, Scene } from 'phaser';

export default class ProjectileRenderer {
	projectiles: { [key: string]: GameObjects.Image } = {};
	scene: Scene;

	initialize(scene) {
		const instance = this;
		function rebind(func: Function) {
			// This function returns a function that will be called by Phaser.
			// Phaser calls the returned function after they bind it's `this` property
			// to the phaser game scene.
			// We want our class to work like a normal class - all this class's methods
			// should have their `this` referring to the instance of the Game object.
			// To accomplish this, we rebind the class function, e.g. this.create, to the instance,
			// and then we pass in the scene as an argument.
			return function (event) {
				return func.bind(instance)(event.payload);
			};
		}
		EngineState.eventBus.listen(
			EventType.ENGINE_UPDATE_PROJECTILE,
			rebind(this.updateProjectile),
		);
		EngineState.eventBus.listen(EventType.ENGINE_GAME_OBJECT_ADDED, rebind(this.addProjectile));
		EngineState.eventBus.listen(
			EventType.ENGINE_REMOVE_PROJECTILE,
			rebind(this.removeProjectile),
		);

		this.scene = scene;
	}

	addProjectile(event) {
		if (event.entityType !== EntityType.PROJECTILE) return;

		const sprite = new GameObjects.Image(this.scene, event.x, event.y, event.sprite);
		this.scene.add.existing(sprite);
		this.projectiles[event.name] = sprite;
	}

	updateProjectile(event) {
		const phaserProjectile = this.projectiles[event.name];
		if (event.x && event.y) {
			phaserProjectile.setPosition(event.x, event.y);
		}
	}

	removeProjectile(event) {
		const phaserProjectile = this.projectiles[event.name];
		phaserProjectile.setVisible(false);
		phaserProjectile.setActive(false);
	}
}
