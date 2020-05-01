import { CollideableGameObject, AIGameObject, Faction, EntityType } from '../common/types/objects';
import { Uuid } from '../helpers/misc';

type AggroObjectProps = {
	owner: AIGameObject;
	aggroRange: number;
	maxAggroRange: number;
};

// TODO: Verify this aggro object is maintaining aggro when player is in aggro range
// TODO: Consider adding extended aggro range for certain rules, e.g. can attack at edge of aggro but not move
// TODO: We should only ever check for collisions if our AI's attentionSpan is reset
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

	constructor({ owner, aggroRange }: AggroObjectProps) {
		this.name = Uuid();
		this.width = aggroRange;
		this.height = aggroRange;
		this.radius = aggroRange / 2;
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
