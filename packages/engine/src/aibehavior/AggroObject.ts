import { CollideableGameObject, AIGameObject, Faction, EntityType } from '../common/types/objects';
import { Uuid } from '../helpers/misc';
import { DistanceBetweenPoints } from '../helpers/math';

type AggroObjectProps = {
	owner: AIGameObject;
	aggroRange: number;
	maxAggroRange: number;
};

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
	collidedObjects: CollideableGameObject[];

	// These are added to make the World instance able to collide with this
	type: string = 'EngineOnly';
	faction: Faction = Faction.ENEMY;
	sprite: string;
	entityType: EntityType = EntityType.OTHER;

	// Aggro is a circle wherein the enemy is in the center of the circle
	// The passed aggro range is how far away from the enemy someone has to be to aggro it,
	// i.e. the radius of the circle is the range
	constructor({ owner, aggroRange }: AggroObjectProps) {
		this.name = Uuid();
		this.width = aggroRange * 2;
		this.height = aggroRange * 2;
		this.radius = aggroRange;
		this.x = owner.x;
		this.y = owner.y;
		this.owner = owner;
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
