import Phaser from 'phaser';
import EngineState from '../EngineState';
import { Directions } from '../helpers/constants';
import GameControls from './GameControls';
import ClientState from './ClientState';
import Shooter from '../common/entities/player/shooter';
import Enemy from '../common/entities/ai/enemy';

export default class PhaserGame {
	gameInstance: Phaser.Game;
	player: Shooter;

	initialize() {
		const instance = this;
		function rebind(func: Function) {
			// This function returns a function that will be called by Phaser.
			// Phaser calls the returned function after they bind it's `this` property
			// to the phaser game scene.
			// We want our class to work like a normal class - all this class's methods
			// should have their `this` referring to the instance of the Game object.
			// To accomplish this, we rebind the class function, e.g. this.create, to the instance,
			// and then we pass in the scene as an argument.
			return function () {
				const scene = this;
				return func.bind(instance)(scene);
			};
		}

		const gameConfig = {
			type: Phaser.CANVAS,
			parent: 'game',
			width: 3200,
			height: 3200,
			roundPixels: true,
			scale: {
				mode: Phaser.Scale.RESIZE,
			},
			scene: {
				preload: rebind(this.preload),
				create: rebind(this.create),
				update: rebind(this.update),
			},
		};

		this.gameInstance = new Phaser.Game(gameConfig);
	}

	preload(scene: Phaser.Scene) {
		console.log('phasergame preloading');
		// Load in images and sprites
		scene.load.image('player', ['assets/sprites/player.png']);

		scene.load.image('bullet', 'assets/sprites/bullets/bullet6.png');
		scene.load.image('target', 'assets/demoscene/ball.png');
		scene.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');
		scene.load.image('tiles', 'assets/tilemaps/blowharder.png');
	}

	create(scene: Phaser.Scene) {
		// Initialize tilemaps before objects
		const map = scene.make.tilemap({
			key: 'map',
		});

		const tileset = map.addTilesetImage('blowharder', 'tiles');
		map.createStaticLayer('World', tileset, 0, 0);
		const collisionLayer = map
			.createStaticLayer('Collision', tileset, 0, 0)
			.setCollisionByExclusion([0, -1]);
		EngineState.world.setTilemapLayers(collisionLayer);

		ClientState.personRenderer.initialize(scene);
		ClientState.projectileRenderer.initialize(scene);
		ClientState.player.initialize();

		// TODO: REMOVE THIS, only for testing
		EngineState.world.addGameObject(new Enemy({ coordinates: { x: 1100, y: 1100 } }));

		// Initialize camera
		scene.cameras.main.zoom = 0.6;
		scene.cameras.main.startFollow(ClientState.player.phaserInstance);
		scene.cameras.main.setRoundPixels(true)

		// Initialize player controls
		const controls = new GameControls(scene.input.keyboard);
		controls.addKey({
			key: 'W',
			onKeydown: () => {
				ClientState.player.engineInstance.handlePlayerMove(Directions.Forward, true)
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handlePlayerMove(
					Directions.Forward,
					false,
				);
			},
		});
		controls.addKey({
			key: 'S',
			onKeydown: () => {
				ClientState.player.engineInstance.handlePlayerMove(
					Directions.Backward,
					true,
				);
			},
			onKeyup: () => {
				ClientState.player.engineInstance.handlePlayerMove(
					Directions.Backward,
					false,
				);
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

		controls.onMouseDown(scene, () => {
			ClientState.player.engineInstance.handleMouseDown();
		});

		controls.onMouseUp(scene, () => {
			ClientState.player.engineInstance.handleMouseUp();
		});

		scene.input.on('pointermove', (pointer) => {
			ClientState.player.engineInstance.handlePointerMove(pointer.worldX, pointer.worldY);
		});

		window.addEventListener('blur', () => {
			ClientState.player.engineInstance.handleBlur();
		});

		window.addEventListener('focus', () => {
			ClientState.player.engineInstance.handleFocus();
		})
	}

	update(scene: Phaser.Scene) {
		EngineState.timeStep.tick(scene.game.loop.rawDelta);
	}
}
