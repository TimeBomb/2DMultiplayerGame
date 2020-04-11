// From https://phaser.io/examples/v3/view/games/topdownshooter/topdowncombatmechanics#
import Phaser, { Scene } from 'phaser';
import Controls from './something/controls';
import { Directions } from './constants/constants';
import Person from './entities/person';
import { CollideableGameObject } from './types';

// todo: better name
export default class Game {
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

	constructor() {
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

		const config = {
			type: Phaser.CANVAS,
			parent: 'game',
			width: 1920,
			height: 1080,
			scale: {
				mode: Phaser.Scale.RESIZE,
				autoCenter: Phaser.Scale.CENTER_BOTH,
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
		scene.load.spritesheet('player_handgun', 'assets/sprites/player_handgun.png', {
			frameWidth: 66,
			frameHeight: 60,
		}); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
		scene.load.image('bullet', 'assets/sprites/bullets/bullet6.png');
		scene.load.image('target', 'assets/demoscene/ball.png');
		scene.load.image('background', 'assets/skies/underwater1.png');
	}

	create(scene: Phaser.Scene) {
		// Add background player, enemy, healthpoint sprites
		this.background = scene.add.image(800, 600, 'background');

		this.player = new Person(scene, 800, 600);
		this.enemy = new Person(scene, 500, 400);

		this.cursor = scene.add.container(0, 0);

		this.hp1 = scene.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
		this.hp2 = scene.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
		this.hp3 = scene.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

		// Set image/sprite properties
		this.background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
		this.hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
		this.hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
		this.hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

		// Set sprite variables
		// enemy.health = 3;
		// enemy.lastFired = 0;

		// Set camera properties
		scene.cameras.main.zoom = 0.5;
		scene.cameras.main.startFollow(this.player);

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
	}

	// function enemyHitCallback(enemyHit, bulletHit) {
	// 	// Reduce health of enemy
	// 	if (bulletHit.active === true && enemyHit.active === true) {
	// 		enemyHit.health = enemyHit.health - 1;

	// 		// Kill enemy if health <= 0
	// 		if (enemyHit.health <= 0) {
	// 			enemyHit.setActive(false).setVisible(false);
	// 		}

	// 		// Destroy bullet
	// 		bulletHit.setActive(false).setVisible(false);
	// 	}
	// }

	// function playerHitCallback(playerHit, bulletHit) {
	// 	// Reduce health of player
	// 	if (bulletHit.active === true && playerHit.active === true) {
	// 		playerHit.health = playerHit.health - 1;
	// 		console.log('Player hp: ', playerHit.health);

	// 		// Kill hp sprites and kill player if health <= 0
	// 		if (playerHit.health == 2) {
	// 			hp3.destroy();
	// 		} else if (playerHit.health == 1) {
	// 			hp2.destroy();
	// 		} else {
	// 			hp1.destroy();
	// 			// Game over state should execute here
	// 		}

	// 		// Destroy bullet
	// 		bulletHit.setActive(false).setVisible(false);
	// 	}
	// }

	// function enemyFire(enemy, player, time, gameObject) {
	// 	if (enemy.active === false) {
	// 		return;
	// 	}

	// 	if (time - enemy.lastFired > 1000) {
	// 		enemy.lastFired = time;

	// 		// Get bullet from bullets group
	// 		const bullet = enemyBullets.get().setActive(true).setVisible(true);

	// 		if (bullet) {
	// 			bullet.fire(enemy, player);
	// 			// TODO: Add collider to bullet
	// 		}
	// 	}
	// }

	update(scene: Phaser.Scene, time, delta) {
		// Rotates player to face towards cursor
		this.player.tick(this.game, this.cursor);
		// Rotates enemy to face towards player
		this.enemy.updateRotation(this.player);
		// Make enemy fire
		if (Math.random() > 0.98) {
			this.enemy.attack(this.player);
		}

		this.checkCollision(scene);
	}

	checkCollision(scene: Phaser.Scene) {
		const validObjectTypes = ['Image', 'Sprite'];
		const checkedList: { [key: string]: string[] } = {};
		return new Promise((resolve) => {
			const gameObjects = scene.children.getChildren();
			gameObjects.forEach((objA: Phaser.GameObjects.GameObject) => {
				gameObjects.forEach((objB: Phaser.GameObjects.GameObject) => {
					// If objects don't have names, or are same,
					// or objects have already been checked together,
					// or objects are invalid types, then return
					if (
						!objA.active ||
						!objB.active ||
						!objA.name ||
						!objB.name ||
						objB.name === objA.name ||
						(checkedList[objB.name] && checkedList[objB.name].includes(objA.name)) ||
						!validObjectTypes.includes(objA.type) ||
						!validObjectTypes.includes(objB.type)
					) {
						return;
					}

					const validObjA = objA as CollideableGameObject;
					const validObjB = objB as CollideableGameObject;
					// If neither objects can be hit, don't check collision
					if (!validObjA.isHittable && !validObjB.isHittable) return;

					const boundsA = validObjA.getBounds();
					const boundsB = validObjB.getBounds();

					const isCollided = Phaser.Geom.Intersects.RectangleToRectangle(
						boundsA,
						boundsB,
					);
					if (isCollided) {
						validObjA.onCollide && validObjA.onCollide(validObjB);
						validObjB.onCollide && validObjB.onCollide(validObjA);
					}

					checkedList[objB.name] = [] || checkedList[objB.name];
					checkedList[objB.name].push(objA.name);
					checkedList[objA.name] = [] || checkedList[objA.name];
					checkedList[objA.name].push(objB.name);
				});
			});

			resolve();
		});
	}
}
