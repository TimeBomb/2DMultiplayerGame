import { GameObjects, Scene } from 'phaser';

import EngineState from '../EngineState';
import Player from '../common/entities/base/player';
import ClientState from './ClientState';
import { Directions } from '../helpers/constants';
import GameControls from './GameControls';
import { GameEvent } from '../common/types/events';

// TODO: Move logout on login failure to somewhere more appropriate
// TODO: Test that login success/failure events are being handled appropriately
export default class PlayerState {
	engineInstance: Player;
	phaserInstance: GameObjects.Sprite;
	scene: Scene;
	user: any;

	initializeScene(scene: Scene) {
		this.scene = scene;
	}

	initializeOnLogin(loginEvent: GameEvent) {
		this.user = loginEvent.payload;
	}

	loadPlayer() {
		const player = new Player({ coordinates: { x: this.user.x, y: this.user.y } });
		EngineState.world.addGameObject(player);

		this.phaserInstance = ClientState.personRenderer.persons[player.name];

		this.engineInstance = player;

		this.scene.cameras.main.startFollow(ClientState.player.phaserInstance);

		// Initialize player controls
		const controls = new GameControls(this.scene.input.keyboard);
		controls.addKey({
			key: 'W',
			onKeydown: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Forward, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Forward, false);
			},
		});
		controls.addKey({
			key: 'S',
			onKeydown: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Backward, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Backward, false);
			},
		});
		controls.addKey({
			key: 'A',
			onKeydown: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Left, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Left, false);
			},
		});
		controls.addKey({
			key: 'D',
			onKeydown: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Right, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Right, false);
			},
		});

		controls.onMouseDown(this.scene, () => {
			ClientState.player.engineInstance.handleMouseDown();
		});

		controls.onMouseUp(this.scene, () => {
			ClientState.player.engineInstance.handleMouseUp();
		});

		this.scene.input.on('pointermove', (pointer) => {
			ClientState.player.engineInstance.handlePointerMove(pointer.worldX, pointer.worldY);
		});

		window.addEventListener('blur', () => {
			ClientState.player.engineInstance.handleBlur();
		});
	}
}
