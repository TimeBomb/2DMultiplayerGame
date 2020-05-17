import Phaser from 'phaser';
import EngineState from '../EngineState';
import ClientState from './ClientState';
import Player from '../common/entities/base/player';

export default class PhaserGame {
	gameInstance: Phaser.Game;
	player: Player;

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
		// Load in images and sprites
		scene.load.image('player', ['assets/sprites/player.png']);
		scene.load.image('enemy', ['assets/sprites/player.png']);
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
		ClientState.player.initializeScene(scene);
		ClientState.player.loadPlayer();

		// Initialize camera
		scene.cameras.main.zoom = 0.6;
	}

	update(scene: Phaser.Scene) {
		EngineState.timeStep.tick(scene.game.loop.rawDelta);
	}
}
