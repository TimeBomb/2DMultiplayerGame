import { encode, decode } from '@msgpack/msgpack';
import { GameEvent } from '../common/types/events';

export function serialize(obj: GameEvent[]) {
	return encode(obj);
}

export function deserialize(str): GameEvent[] {
	return decode(str) as GameEvent[];
}
