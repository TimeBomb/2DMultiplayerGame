import EngineState from '../EngineState';
import Shooter from '../common/entities/player/shooter';
import ClientState from './ClientState';
import { GameObjects } from 'phaser';

export default class Player {
	engineInstance: Shooter;
	phaserInstance: GameObjects.Sprite;

	initialize() {
		const player = new Shooter({ coordinates: { x: 600, y: 600 } });
		EngineState.world.addGameObject(player);

		this.phaserInstance = ClientState.personRenderer.persons[player.name];
		console.log('player initd with phaser instance', this.phaserInstance);
		this.engineInstance = player;
	}
}
