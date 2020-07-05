import EngineState from '../engine/src/EngineState';
import { EventType, GameEvent } from '../engine/src/common/types/events';
import { GameObject } from '../engine/src/common/types/objects';
import PersonNetworkState from '../engine/src/common/PersonNetworkState';
import { EntityType } from '../engine/src/common/types/objects';

// TODO ASAP: This is constantly returning unchanged events
// And also AI isn't dispatching action events on server for some reason
// Are we dispatching player action events from client to server appropriately?
// Maybe AI not responding because of an issue here?
export default class PersonActionEventSender {
	networkStates: { [key: string]: PersonNetworkState } = {};
	lastNetworkStates: { [key: string]: GameEvent } = {};

	constructor() {
		Object.values(EngineState.world.gameObjects).forEach((obj: GameObject) => {
			if (obj.entityType === EntityType.AI || obj.entityType === EntityType.PLAYER) {
				this.networkStates[obj.name] = new PersonNetworkState(obj.name);
			}
		});

		EngineState.eventBus.listen(
			EventType.ENGINE_GAME_OBJECT_ADDED,
			this.handleAddPersonNetworkState.bind(this),
		);
		console.log('listening for game obj added');

		EngineState.eventBus.listen(
			EventType.ENGINE_GAME_OBJECT_DELETED,
			this.handleRemovePersonNetworkState.bind(this),
		);
	}

	handleAddPersonNetworkState(event: GameEvent) {
		console.log('handling game object added', event);
		if (
			event.payload.entityType === EntityType.AI ||
			event.payload.entityType === EntityType.PLAYER
		) {
			this.networkStates[event.payload.name] = new PersonNetworkState(event.payload.name);
		}
	}

	handleRemovePersonNetworkState(event: GameEvent) {
		if (this.networkStates[event.payload.name]) {
			delete this.networkStates[event.payload.name];
		}
	}

	getLatestEvents(): GameEvent[] {
		return Object.keys(this.networkStates)
			.map((entityName) => {
				const networkState = this.networkStates[entityName];
				const event = networkState.toEvent(this.lastNetworkStates[entityName]);

				if (event) {
					this.lastNetworkStates[entityName] = event;
					return event;
				} else {
					return null;
				}
			})
			.filter((event) => {
				return !!event;
			});
	}
}
