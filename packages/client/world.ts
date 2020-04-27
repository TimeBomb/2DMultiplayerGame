import { CollideableGameObject, GameObjectBounds, Rectangle } from './types';

export default class World {
	collisionLayer: Phaser.Tilemaps.StaticTilemapLayer;
	worldLayer: Phaser.Tilemaps.StaticTilemapLayer;
	scene: Phaser.Scene;

	constructor(scene: Phaser.Scene) {
		const map = scene.make.tilemap({
			key: 'map',
		});
		this.scene = scene;
		const tileset = map.addTilesetImage('blowharder', 'tiles');
		this.worldLayer = map.createStaticLayer('World', tileset, 0, 0);
		this.collisionLayer = map
			.createStaticLayer('Collision', tileset, 0, 0)
			.setCollisionByExclusion([0, -1]);
	}

	// Check collision on all game objects
	checkCollision(scene: Phaser.Scene) {
		const validObjectTypes = ['Image', 'Sprite'];
		const checkedList: { [key: string]: string[] } = {};
		return new Promise((resolve) => {
			const gameObjects = scene.children.getChildren();
			gameObjects.forEach((objA: Phaser.GameObjects.GameObject) => {
				if (!objA.active || !objA.name || !validObjectTypes.includes(objA.type)) {
					return;
				}
				const validObjA = objA as CollideableGameObject;

				gameObjects.forEach((objB: Phaser.GameObjects.GameObject) => {
					// If objects don't have names, or are same,
					// or objects have already been checked together,
					// or objects are invalid types, then return
					if (
						!objB.active ||
						!objB.name ||
						objB.name === objA.name ||
						(checkedList[objB.name] && checkedList[objB.name].includes(objA.name)) ||
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

	// Check collision of specific game object on tilemap
	// This logic is about the same as the phaser arcade physics `collideSpriteVsTilesHandler`
	// Returns true if collided, false if not
	// TODO: This still bugs on certain corners, getting the user stuck
	checkWorldCollision(objBounds: Rectangle): Boolean {
		// Get the individual tiles next to object
		// TODO: Figure out why - 1 works
		let leftTile = Math.round(objBounds.left / this.collisionLayer.tilemap.tileWidth) - 1;
		let rightTile = Math.round(objBounds.right / this.collisionLayer.tilemap.tileWidth) - 1;
		let topTile = Math.round(objBounds.top / this.collisionLayer.tilemap.tileHeight) - 1;
		let bottomTile = Math.round(objBounds.bottom / this.collisionLayer.tilemap.tileHeight) - 1;
		// console.log('l r t b tiles', leftTile, rightTile, topTile, bottomTile);

		// Make sure we don't errorenously try checking against a nonexistant tile
		if (leftTile < 0) leftTile = 0;
		if (rightTile > this.collisionLayer.tilemap.width)
			rightTile = this.collisionLayer.tilemap.width;
		if (topTile < 0) topTile = 0;
		if (bottomTile > this.collisionLayer.tilemap.height)
			bottomTile = this.collisionLayer.tilemap.height;

		for (let i = leftTile; i <= rightTile; i++) {
			for (let j = topTile; j <= bottomTile; j++) {
				const t = this.collisionLayer.tilemap.getTileAt(i, j);
				if (!t || !t.canCollide) continue;
				const tr = {
					left: t.getLeft(),
					bottom: t.getBottom(),
					right: t.getRight(),
					top: t.getTop(),
				};
				if (t && t.canCollide) {
					const pr = this.scene.add.rectangle(
						objBounds.left,
						objBounds.top,
						objBounds.right - objBounds.left,
						objBounds.bottom - objBounds.top,
						0x0000ff,
						1.0,
					);
					const trr = this.scene.add.rectangle(
						tr.left,
						tr.top,
						tr.right - tr.left,
						tr.bottom - tr.top,
						0xff0000,
						0.45,
					);
					window.setTimeout(() => {
						pr.setAlpha(0.15);
						trr.setAlpha(0.15);
					}, 100);
					window.setTimeout(() => {
						pr.setVisible(false);
						trr.setVisible(false);
					}, 400);

					// console.log('objbounds', objBounds);
					return true;
				}
			}
		}

		return false;
	}
}
