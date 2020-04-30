import PhaserGame from './PhaserGame';
import Player from './Player';
import PersonRenderer from './PersonRenderer';
import ProjectileRenderer from './ProjectileRenderer';

export default {
	game: new PhaserGame(),
	player: new Player(),
	personRenderer: new PersonRenderer(),
	projectileRenderer: new ProjectileRenderer(),
};
