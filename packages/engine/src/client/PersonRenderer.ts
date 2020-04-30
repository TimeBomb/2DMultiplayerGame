import ClientState from './ClientState';
import { GameObjects, Scene } from 'phaser';
import EngineState from '../EngineState';
import { EventType } from '../common/types/events';
import Person from '../common/entities/base/person';
import { EntityType } from '../common/types/objects';

export default class PersonRenderer {
	persons: { [key: string]: GameObjects.Sprite } = {};
	scene: Scene;

	initialize(scene: Phaser.Scene) {
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

		EngineState.eventBus.listen(EventType.GAME_OBJECT_ADDED, rebind(this.addPerson));
		EngineState.eventBus.listen(EventType.UPDATE_PERSON, rebind(this.updatePerson));
		EngineState.eventBus.listen(EventType.PERSON_DEAD, rebind(this.killPerson));

		this.scene = scene;
	}

	addPerson(event) {
		if (event.entityType !== EntityType.PERSON) return;

		const sprite = new GameObjects.Sprite(this.scene, event.x, event.y, event.sprite);
		sprite.setScale(1.5, 1.5);

		this.scene.add.existing(sprite);
		this.persons[event.name] = sprite;
	}

	updatePerson(event) {
		const phaserPerson = this.persons[event.name];
		if (event.x && event.y) {
			phaserPerson.setPosition(event.x, event.y);
		}
		if (event.rotation) {
			phaserPerson.setRotation(event.rotation);
		}
		phaserPerson.setVisible(true);
	}

	killPerson(event) {
		const phaserPerson = this.persons[event.name];
		phaserPerson.setVisible(false);
	}
}
