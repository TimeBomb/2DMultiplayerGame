import { Coords } from '../common/types/world';
import { CollideableGameObject, AIGameObject } from '../common/types/objects';

type AggroObjectProps = {
	owner: AIGameObject;
	aggroRange: number;
};

export default class AggroObject {
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
	owner: AIGameObject;
	isAggroObject: boolean = true;

	constructor({ owner, aggroRange }: AggroObjectProps) {
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
}
