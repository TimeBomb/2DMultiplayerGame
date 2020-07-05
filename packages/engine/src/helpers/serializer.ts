import { encode, decode } from '@msgpack/msgpack';
import { GameEvent } from '../common/types/events';

// TODO: msgpack is actually slower than JSON, though it is smaller https://github.com/msgpack/msgpack-javascript
export function serialize(obj: GameEvent[]) {
	return encode(obj);
}

export function deserialize(str): GameEvent[] {
	return decode(str) as GameEvent[];
}
