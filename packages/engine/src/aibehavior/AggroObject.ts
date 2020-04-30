import { Coords } from '../common/types/world';
import { CollideableGameObject, AIGameObject, Faction, EntityType } from '../common/types/objects';
import { Uuid } from '../helpers/misc';

type AggroObjectProps = {
	owner: AIGameObject;
	aggroRange: number;
};

// TODO: This aggro range isn't working perfectly
// Sometimes when in aggro range, enemy is not attacking
// And sometimes when out of aggro range, enemy is still attacking
export default class AggroObject {
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
	owner: AIGameObject;
	isAggroObject: boolean = true;
	active: boolean = true;
	name: string;

	// These are added to make the World instance able to collide with this
	type: string = 'EngineOnly';
	faction: Faction = Faction.ENEMY;
	sprite: string;
	entityType: EntityType = EntityType.OTHER;

	constructor({ owner, aggroRange }: AggroObjectProps) {
		this.name = Uuid();
		this.width = aggroRange;
		this.height = aggroRange;
		this.radius = aggroRange / 2;
		this.x = owner.x;
		this.y = owner.y;
		this.owner = owner;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}

	onCollide(gameObjects: CollideableGameObject[]) {
		this.owner.weighTargets(gameObjects);
	}

	getBounds() {
		return {
			x: this.x,
			y: this.y,
			width: this.width,
			height: this.height,
			bottom: this.y + this.height,
			right: this.x + this.width,
		};
	}
}
