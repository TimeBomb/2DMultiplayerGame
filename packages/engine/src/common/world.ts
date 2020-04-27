import { CollideableGameObject, Rectangle, GameObject, AggroGameObject } from './types/objects';
import { StaticTilemapLayer } from './types/world';
import { RectangleToRectangle, CircleToRectangle } from '../helpers/math';
import EngineState from '../EngineState';
import { GameEvent, EventType } from './types/events';

// TODO for client and server: Need to make this only contain common logic between server and client
// Server will specifically have to worry about replicating collideable tileset for this.collisionLayer
// Client can implement most of this rendering
// Server may be able to use tmxjs, or perhaps we can just create our own
// script that can setup the collideable tilemap so we can iterate over it
// Need to make sure client and server world.ts engine files are both passes collision+world layer
export default class World {
	collisionLayer: StaticTilemapLayer;
	worldLayer: StaticTilemapLayer;
	gameObjects: { [key: string]: GameObject };
	deadGameObjects: { name: string; respawnTime: number }[];

	constructor() {
		EngineState.eventBus.listen(EventType.DEAD, ({ name, respawnTime }) => {
			this.deadGameObjects.push({ name, respawnTime });
		});
	}

	addGameObject(obj: GameObject) {
		this.gameObjects[obj.name] = obj;
		EngineState.eventBus.dispatch(new GameEvent(EventType.GAME_OBJECT_ADDED, obj));
	}

	// TODO: Name these two collision methods better
	// Check if game objects are colliding with other game objects
	checkCollisionForObjects() {
		const validObjectTypes = ['Image', 'Sprite'];
		const checkedList: { [key: string]: string[] } = {};

		// Get all collisions with aggro objects, to send back to the AI persons
		// aggroCollisions is the list of all objects that have collided with `name of aggroobject's owner`
		// aggroCollisionsObjects is a map of `name of aggroobject's owner` to the aggro object
		const aggroCollisions: { [key: string]: CollideableGameObject[] } = {};
		const aggroCollisionsObjects: { [key: string]: CollideableGameObject } = {};

		const gameObjKeys = Object.keys(this.gameObjects);
		for (let i = 0; i < gameObjKeys.length; i++) {
			const objA = this.gameObjects[gameObjKeys[i]];
			if (!objA.active || !objA.name || !validObjectTypes.includes(objA.type)) {
				continue;
			}
			const validObjA = objA as CollideableGameObject;

			for (let j = 0; j < gameObjKeys.length; j++) {
				const objB = this.gameObjects[gameObjKeys[j]];
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
					continue;
				}

				const validObjB = objB as CollideableGameObject;
				// If neither objects can be hit, don't check collision
				if (!validObjA.isHittable && !validObjB.isHittable) return;

				// Don't compare two aggro objects directly
				if (validObjA.isAggroObject && validObjB.isAggroObject) return;

				// Don't compare two objects that don't have collision events
				if (!validObjA.onCollide && !validObjB.onCollide) return;

				// Comparisons are different for aggro objects
				if (validObjA.isAggroObject || validObjB.isAggroObject) {
					const aggroRadius = validObjA.isAggroObject ? validObjA : validObjB;
					const obj = validObjA.isAggroObject ? validObjB : validObjA;

					const isCollided = CircleToRectangle(aggroRadius, obj.getBounds());
					if (isCollided) {
						aggroCollisions[aggroRadius.owner.name] =
							aggroCollisions[aggroRadius.owner.name] || [];
						aggroCollisions[aggroRadius.owner.name].push(obj);

						aggroCollisionsObjects[aggroRadius.owner.name] = aggroRadius;
					}
				} else {
					const boundsA = validObjA.getBounds();
					const boundsB = validObjB.getBounds();

					const isCollided = RectangleToRectangle(boundsA, boundsB);
					if (isCollided) {
						validObjA.onCollide && validObjA.onCollide(validObjB);
						validObjB.onCollide && validObjB.onCollide(validObjA);
					}

					checkedList[objB.name] = [] || checkedList[objB.name];
					checkedList[objB.name].push(objA.name);
					checkedList[objA.name] = [] || checkedList[objA.name];
					checkedList[objA.name].push(objB.name);
				}
			}
		}

		Object.keys(aggroCollisionsObjects).forEach((objOwnerName: string) => {
			const aggroObject = aggroCollisionsObjects[objOwnerName] as AggroGameObject;
			const collidedObjs = aggroCollisions[objOwnerName] as CollideableGameObject[];

			aggroObject.onCollide(collidedObjs);
		});
	}

	// Check collision of specific game object on tilemap
	// This logic is about the same as the phaser arcade physics `collideSpriteVsTilesHandler`
	// Returns true if collided, false if not
	checkWorldCollisionByObject(objBounds: Rectangle): Boolean {
		// Get the individual tiles next to object
		// TODO: Figure out why `- 1` works - maybe because getTileAt is off by one, not left/right/top/bottom tile?
		let leftTile = Math.round(objBounds.left / this.collisionLayer.tilemap.tileWidth) - 1;
		let rightTile = Math.round(objBounds.right / this.collisionLayer.tilemap.tileWidth) - 1;
		let topTile = Math.round(objBounds.top / this.collisionLayer.tilemap.tileHeight) - 1;
		let bottomTile = Math.round(objBounds.bottom / this.collisionLayer.tilemap.tileHeight) - 1;

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
				return true;
			}
		}

		return false;
	}
}
