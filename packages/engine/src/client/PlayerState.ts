import { GameObjects, Scene } from 'phaser';

import EngineState from '../EngineState';
import Player from '../common/entities/base/player';
import ClientState from './ClientState';
import { Directions } from '../helpers/constants';
import GameControls from './GameControls';
import { GameEvent } from '../common/types/events';
import { EntityType } from '../common/types/objects';
import aiTypes from '../common/aiTypes';
import playerTypes from '../common/playerTypes';
import projectileTypes from '../common/projectileTypes';

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

	// TODO Finish spawn stuff here
	initializeOnLogin(loginEvent: GameEvent) {
		const spawns = loginEvent.payload.spawns;
		this.user = loginEvent.payload.user;
		spawns.forEach((spawn) => {
			let gameObj;
			switch (spawn.entityType) {
				case EntityType.AI:
					gameObj = aiTypes[spawn.aiType](spawn);
					break;
				case EntityType.PLAYER:
					gameObj = playerTypes[spawn.playerType](spawn);
					break;
				case EntityType.PROJECTILE:
					gameObj = projectileTypes[spawn.projectileType](spawn);
					break;
			}
			if (gameObj) {
				EngineState.world.addGameObject(gameObj);
			}
		});
	}

	async initializePlayer() {
		return new Promise((resolve) => {
			while (!this.user || !this.scene) {}
			this.loadPlayer();
			resolve(true);
		});
	}

	loadPlayer() {
		const player = playerTypes[this.user.playerType](this.user);
		EngineState.world.addGameObject(player);

		this.phaserInstance = ClientState.personRenderer.persons[player.name];

		this.engineInstance = player;

		this.scene.cameras.main.startFollow(ClientState.player.phaserInstance);

		// Initialize player controls
		const controls = new GameControls(this.scene.input.keyboard);
		controls.addKey({
			key: 'W',
			onKeydown: () => {
				ClientState.player.engineInstance.handleMove(Directions.Forward, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handleMove(Directions.Forward, false);
			},
		});
		controls.addKey({
			key: 'S',
			onKeydown: () => {
				ClientState.player.engineInstance.handleMove(Directions.Backward, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handleMove(Directions.Backward, false);
			},
		});
		controls.addKey({
			key: 'A',
			onKeydown: () => {
				ClientState.player.engineInstance.handleMove(Directions.Left, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handleMove(Directions.Left, false);
			},
		});
		controls.addKey({
			key: 'D',
			onKeydown: () => {
				ClientState.player.engineInstance.handleMove(Directions.Right, true);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handleMove(Directions.Right, false);
			},
		});

		controls.onMouseDown(this.scene, () => {
			ClientState.player.engineInstance.handleMouseDown();
		});

		controls.onMouseUp(this.scene, () => {
			ClientState.player.engineInstance.handleMouseUp();
		});

		this.scene.input.on('pointermove', (pointer) => {
			ClientState.player.engineInstance.handlePointerMove({
				x: pointer.worldX,
				y: pointer.worldY,
			});
		});

		window.addEventListener('blur', () => {
			ClientState.player.engineInstance.handleBlur();
		});
	}
}
