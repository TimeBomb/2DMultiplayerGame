import EngineState from '../EngineState';
import Shooter from '../common/entities/player/shooter';
import ClientState from './ClientState';
import { GameObjects } from 'phaser';

export default class Player {
	engineInstance: Shooter;
	phaserInstance: GameObjects.Sprite;

	initialize() {
		const player = new Shooter({ coordinates: { x: 900, y: 900 } });
		EngineState.world.addGameObject(player);

		this.phaserInstance = ClientState.personRenderer.persons[player.name];

		this.engineInstance = player;
	}
}
