import {
	CollideableGameObject,
	Rectangle,
	GameObject,
	AggroGameObject,
	Faction,
	Bounds,
} from './types/objects';
import { StaticTilemapLayer } from './types/world';
import { RectangleToRectangle, CircleToRectangle } from '../helpers/math';
import EngineState from '../EngineState';
import { GameEvent, EventType } from './types/events';

export default class World {
	collisionLayer: StaticTilemapLayer;
	gameObjects: { [key: string]: GameObject } = {};
	deadGameObjects: { name: string; respawnTime: number }[] = [];

	// We'll have to initialize this after construction since EngineState includes world
	initialize() {
		EngineState.eventBus.listen(EventType.PERSON_DEAD, ({ name, respawnTime }) => {
			this.deadGameObjects.push({ name, respawnTime });
		});
		EngineState.eventBus.listen(EventType.TICK, this.checkCollisionForObjects.bind(this));
	}

	setTilemapLayers(collisionLayer: StaticTilemapLayer) {
		this.collisionLayer = collisionLayer;
	}

	addGameObject(obj: GameObject) {
		this.gameObjects[obj.name] = obj;
		EngineState.eventBus.dispatch(
			new GameEvent(EventType.GAME_OBJECT_ADDED, {
				name: obj.name,
				entityType: obj.entityType,
				x: obj.x,
				y: obj.y,
				sprite: obj.sprite,
			}),
		);
	}

	// TODO: Name these two collision methods better
	// Check if game objects are colliding with other game objects
	checkCollisionForObjects() {
		const validObjectTypes = ['Image', 'Sprite', 'EngineOnly'];
		const checkedList: { [key: string]: string[] } = {};

		// Get all collisions with aggro objects, to send back to the AI persons
		// aggroCollisions is the list of all objects that have collided with `name of aggroobject's owner`
		// aggroCollisionsObjects is a map of `name of aggroobject's owner` to the aggro object
		const aggroCollisions: { [key: string]: CollideableGameObject[] } = {};
		const aggroCollisionsObjects: { [key: string]: CollideableGameObject } = {};

		const gameObjKeys = Object.keys(this.gameObjects);
		for (let i = 0; i < gameObjKeys.length; i++) {
			const objA = this.gameObjects[gameObjKeys[i]];
			if (!objA) continue;
			if (objA?.deleted) {
				delete this.gameObjects[objA.name];
				delete this.deadGameObjects[objA.name];
				continue;
			}
			if (!objA.active || !objA.name || !validObjectTypes.includes(objA.type)) {
				continue;
			}
			const validObjA = objA as CollideableGameObject;

			for (let j = 0; j < gameObjKeys.length; j++) {
				const objB = this.gameObjects[gameObjKeys[j]];
				if (!objB) continue;
				if (objB.deleted) {
					delete this.gameObjects[objB.name];
					delete this.deadGameObjects[objB.name];
					continue;
				}
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
				if (!validObjA.isHittable && !validObjB.isHittable) continue;

				// Don't compare two aggro objects directly
				if (validObjA.isAggroObject && validObjB.isAggroObject) continue;

				// Don't compare two objects that don't have collision events
				if (!validObjA.onCollide && !validObjB.onCollide) continue;

				// Comparisons are different for aggro objects
				if (validObjA.isAggroObject || validObjB.isAggroObject) {
					const aggroObj = validObjA.isAggroObject ? validObjA : validObjB;
					const obj = validObjA.isAggroObject ? validObjB : validObjA;

					const objBounds = this._objBoundsWithHitbox(obj);

					const isCollided = CircleToRectangle(aggroObj, objBounds);

					// Always define this, so we can make sure we reset the aggro target if everything leaves the enemy's aggro radius
					aggroCollisions[aggroObj.owner.name] =
						aggroCollisions[aggroObj.owner.name] || [];
					aggroCollisionsObjects[aggroObj.owner.name] = aggroObj;

					// Enemies can't select themselves as a target
					if (aggroObj.owner.name === obj.name) continue;

					if (isCollided && !aggroCollisions[aggroObj.owner.name]?.includes(obj)) {
						aggroCollisions[aggroObj.owner.name].push(obj);
						aggroCollisionsObjects[aggroObj.owner.name] = aggroObj;
					}
				} else {
					const boundsA = this._objBoundsWithHitbox(validObjA);
					const boundsB = this._objBoundsWithHitbox(validObjB);

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

	_objBoundsWithHitbox(obj: CollideableGameObject): Bounds {
		if (!obj.hitboxWidth) return obj.getBounds();

		const bounds = obj.getBounds();
		bounds.width = obj.hitboxWidth;
		bounds.height = obj.hitboxHeight;

		return bounds;
	}

	// Check collision of specific game object on tilemap
	// This logic is about the same as the phaser arcade physics `collideSpriteVsTilesHandler`
	// Returns true if collided, false if not
	checkWorldCollisionByObject(objBounds: Rectangle): Boolean {
		// Get the individual tiles next to object
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
