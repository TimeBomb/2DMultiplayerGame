import PhaserGame from './PhaserGame';
import PlayerState from './PlayerState';
import PersonRenderer from './PersonRenderer';
import ProjectileRenderer from './ProjectileRenderer';

export default {
	game: new PhaserGame(),
	player: new PlayerState(),
	personRenderer: new PersonRenderer(),
	projectileRenderer: new ProjectileRenderer(),
};
