export default class GameControls {
	keyboard;

	constructor(keyboard) {
		this.keyboard = keyboard;
	}

	addKey({ key, onKeydown, onKeyup }) {
		this.keyboard.addKeys(key);
		this.keyboard.on(`keydown_${key}`, onKeydown);
		this.keyboard.on(`keyup_${key}`, onKeyup);
	}

	onClick(scene: Phaser.Scene, callback) {
		scene.input.on('pointerdown', callback);
	}
}
