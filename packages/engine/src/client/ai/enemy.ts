import BaseEnemy, { EnemyProps } from '../../common/entities/ai/enemy';

export default class Enemy extends BaseEnemy {
	constructor({ coordinates, name }: EnemyProps & { name: string }) {
		super({ coordinates });
		this.name = name;
		// TODO: Dispatch events from Enemy that client will need to render. capture them here and render them using Phaser
		// Pass phaser on engine state, leverage that
	}
}
