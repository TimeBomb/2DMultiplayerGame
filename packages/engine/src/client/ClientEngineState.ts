import TimeStep from '../common/utils/timestep';
import EventBus from '../../EventBus';
import World from '../common/world';

const FPS = 60;
const LONG_TICK_MS = 250;


const gameConfig = {
	type: Phaser.CANVAS,
	parent: 'game',
	width: 3200,
	height: 3200,
	scale: {
		mode: Phaser.Scale.RESIZE,
	},
	scene: {
		preload: rebind(this.preload),
		create: rebind(this.create),
		update: rebind(this.update),
		extend: {
			player: null,
			healthpoints: null,
			moveKeys: null,
			playerBullets: null,
			enemyBullets: null,
			time: 0,
		},
	},
};


export default {
	timeStep: new TimeStep({ fps: FPS, longTickMS: LONG_TICK_MS }),
	eventBus: new EventBus(),
	world: new World(),
	
phaseR: new Phaser.Game(config);
};
