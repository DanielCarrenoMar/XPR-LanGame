import { GameObjects, Scene } from 'phaser';

export default class Bush extends GameObjects.Image {
	private static readonly DEPTH_ABOVE_PLAYER = 10;

	constructor(scene: Scene, x: number, y: number, width: number = 160, height: number = 160) {
		super(scene, x, y, 'bush');
		this.setDisplaySize(width, height);

		scene.add.existing(this);

		this.setOrigin(0.5, 1);
		this.setDepth(Bush.DEPTH_ABOVE_PLAYER);
		this.setAlpha(0.9);
	}
}
