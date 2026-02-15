import { GameObjects, Scene } from "phaser";

export default class LifeBar extends GameObjects.Container {
	private readonly heartSize = 80;
	private readonly heartGap = 1;
	private readonly fullTextureKey = "vida";
	private readonly emptyTextureKey = "vidant";
	private readonly hearts: GameObjects.Image[] = [];
	private maxHearts: number;

	constructor(scene: Scene, maxHearts: number, x: number = 16, y: number = 16) {
		super(scene, x, y);
		this.maxHearts = maxHearts;

		for (let i = 0; i < this.maxHearts; i += 1) {
			const heart = scene.add.image(
				i * (this.heartSize + this.heartGap),
				0,
				this.fullTextureKey
			);
			heart.setOrigin(0, 0);
			heart.setDisplaySize(this.heartSize, this.heartSize);
			heart.setScrollFactor(0);
			this.hearts.push(heart);
			this.add(heart);
		}

		this.setScrollFactor(0);
		this.setDepth(1000);
		scene.add.existing(this);
	}

	public setLives(currentLives: number, maxLives: number): void {
		if (maxLives !== this.maxHearts) {
			this.maxHearts = maxLives;
			this.rebuildHearts();
		}

		this.hearts.forEach((heart, index) => {
			const isFull = index < currentLives;
			heart.setTexture(isFull ? this.fullTextureKey : this.emptyTextureKey);
		});
	}

	private rebuildHearts(): void {
		this.removeAll(true);
		this.hearts.length = 0;

		for (let i = 0; i < this.maxHearts; i += 1) {
			const heart = this.scene.add.image(
				i * (this.heartSize + this.heartGap),
				0,
				this.fullTextureKey
			);
			heart.setOrigin(0, 0);
			heart.setDisplaySize(this.heartSize, this.heartSize);
			heart.setScrollFactor(0);
			this.hearts.push(heart);
			this.add(heart);
		}
	}
}
