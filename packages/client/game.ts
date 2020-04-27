// From https://phaser.io/examples/v3/view/games/topdownshooter/topdowncombatmechanics#
import Phaser from 'phaser';
import Controls from './something/controls';
import { Directions } from './constants/constants';
import Person from './entities/person';
import World from './world';
import state from './state';

// todo: better name
export default class Game {
	world: World;
	game: Phaser.Game;
	background: Phaser.GameObjects.Image;
	playerBullets: Phaser.GameObjects.Group;
	enemyBullets: Phaser.GameObjects.Group;
	player: Person;
	enemy: Person;
	hp1: Phaser.GameObjects.Image;
	hp2: Phaser.GameObjects.Image;
	hp3: Phaser.GameObjects.Image;
	cursor;
	playerCamera: Phaser.Cameras.Scene2D.Camera;
	_elapsed: number = 0;
	_frameTime: number;
	_frameTimeMS: number;

	constructor(fps: number) {
		const instance = this;

		this._frameTime = 1 / fps;
		this._frameTimeMS = 1000 * this._frameTime;

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

		const config = {
			type: Phaser.CANVAS,
			parent: 'game',
			width: 3200,
			height: 3200,
			scale: {
				mode: Phaser.Scale.RESIZE,
			},
			scene: {
				preload: rebind(this.preload),
				create: rebind(this.create),
				update: rebind(this.update),
				extend: {
					player: null,
					healthpoints: null,
					moveKeys: null,
					playerBullets: null,
					enemyBullets: null,
					time: 0,
				},
			},
		};

		this.game = new Phaser.Game(config);
	}
	preload(scene: Phaser.Scene) {
		// Load in images and sprites
		scene.load.spritesheet('player', 'assets/sprites/player.png', {
			frameWidth: 32,
			frameHeight: 32,
		}); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
		scene.load.image('bullet', 'assets/sprites/bullets/bullet6.png');
		scene.load.image('target', 'assets/demoscene/ball.png');
		scene.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');
		scene.load.image('tiles', 'assets/tilemaps/blowharder.png');
	}

	create(scene: Phaser.Scene) {
		scene.cameras.main.setBackgroundColor('rgb(0,200,50)');
		// Add background player, enemy, healthpoint sprites

		this.world = new World(scene);

		this.player = new Person(scene, 800, 600, this.world);
		// this.enemy = new Person(scene, 500, 400);

		this.cursor = scene.add.container(0, 0);

		this.hp1 = scene.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
		this.hp2 = scene.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
		this.hp3 = scene.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

		// Set image/sprite properties
		this.hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
		this.hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
		this.hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

		// Set camera properties
		scene.cameras.main.zoom = 0.6;
		scene.cameras.main.startFollow(this.player);
		this.playerCamera = scene.cameras.main;

		const controls = new Controls(scene.input.keyboard);
		controls.addKey({
			key: 'W',
			onKeydown: () => {
				this.player.toggleMovementDirection(Directions.Forward, true);
			},
			onKeyup: () => {
				this.player.toggleMovementDirection(Directions.Forward, false);
			},
		});
		controls.addKey({
			key: 'S',
			onKeydown: () => {
				this.player.toggleMovementDirection(Directions.Backward, true);
			},
			onKeyup: () => {
				this.player.toggleMovementDirection(Directions.Backward, false);
			},
		});
		controls.addKey({
			key: 'A',
			onKeydown: () => {
				this.player.toggleMovementDirection(Directions.Left, true);
			},
			onKeyup: () => {
				this.player.toggleMovementDirection(Directions.Left, false);
			},
		});
		controls.addKey({
			key: 'D',
			onKeydown: () => {
				this.player.toggleMovementDirection(Directions.Right, true);
			},
			onKeyup: () => {
				this.player.toggleMovementDirection(Directions.Right, false);
			},
		});

		controls.onClick(scene, () => {
			this.player.attack(this.cursor);
		});

		scene.input.on('pointermove', (pointer) => {
			this.cursor.x = pointer.worldX;
			this.cursor.y = pointer.worldY;
		});

		window.addEventListener('blur', () => {
			this.player.stopMovement();
		});
	}

	update(scene: Phaser.Scene) {
		state.tickProgress += this.game.loop.delta;
		if (state.tickProgress >= 1000) {
			state.tickProgress -= 1000;
		}

		this._elapsed += this.game.loop.rawDelta;
		const willStep = this._elapsed >= this._frameTimeMS;

		if (willStep) {
			this._elapsed -= this._frameTimeMS;

			this.player.tick(this.game, this._frameTimeMS, this.cursor);

			this.world.checkCollision(scene);
		}

		while (this._elapsed >= this._frameTimeMS) {
			this._elapsed -= this._frameTimeMS;

			this.player.tick(this.game, this._frameTimeMS, this.cursor);

			this.world.checkCollision(scene);
		}

		// this.enemyAI();
	}

	enemyAI() {
		// Make enemy fire and move
		const seed = Math.random();
		if (seed > 0.9) {
			this.enemy.attack(this.player);
		}
		const randomMovement = (direction: Directions) => {
			this.enemy.toggleMovementDirection(direction, true);
			window.setTimeout(() => {
				if (this.enemy.movementDirections.has(direction)) {
					this.enemy.toggleMovementDirection(direction, false);
				}
			}, 450);
		};
		if (seed > 0.98) {
			randomMovement(Directions.Backward);
		} else if (seed > 0.97) {
			randomMovement(Directions.Forward);
		} else if (seed > 0.96) {
			randomMovement(Directions.Left);
		} else if (seed > 0.95) {
			randomMovement(Directions.Right);
		}
		this.enemy.tick(this.game, this._frameTimeMS);

		// Rotates enemy to face towards player
		this.enemy.updateRotation(this.player);
	}
}
