type GameObjects = { [key: string]: object };

// TODO This should be used by client and server engines to create new game objects
export default class Server {
	objects: GameObjects;

	constructor(objects: GameObjects) {
		this.objects = objects;
	}

	createEnemy() {}

	createShooter() {}

	createFireball() {}

	createTimestep() {}

	createFireStaff() {}

	createWorld() {}
}
