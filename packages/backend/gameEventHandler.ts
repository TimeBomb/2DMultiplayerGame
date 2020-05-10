import { GameEvent, EventType } from '../engine/src/common/types/events';
import EngineState from '../engine/src/EngineState';

export default function gameEventHandler(gameEvent: GameEvent) {
	switch (gameEvent.type) {
		case EventType.NETWORK_PLAYER_UPDATE:
			EngineState.eventBus.dispatch(
				new GameEvent(EventType.ENGINE_UPDATE_PERSON_ACTIONS, gameEvent.payload),
			);
			break;
	}
}
