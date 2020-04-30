import Phaser from './ClientState';
import EngineState from '../EngineState';
import { EventType } from '../common/types/events';

export default class PersonRenderer {
	constructor() {
		EngineState.eventBus.listen(EventType.UPDATE_PROJECTILE, this.updateProjectile);
		EngineState.eventBus.listen(EventType.GAME_OBJECT_ADDED, this.addProjectile);
	}

	addProjectile(event) {}

	updateProjectile(event) {}

	killProjectile(event) {}
}
