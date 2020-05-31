import { PersonProps } from './entities/base/person';
import Player from './entities/base/player';

export enum PlayerType {
	Player = 1,
}

export default {
	[PlayerType.Player]: (options: PersonProps & { x: number; y: number }): Player => {
		return new Player(PlayerType.Player, {
			coordinates: { x: options.x, y: options.y }, // If x and y exist, we use that, but if coordinates, already set on `options`, we use that
			...options,
			movementDirections: new Set(options.movementDirections || []),
		});
	},
};
