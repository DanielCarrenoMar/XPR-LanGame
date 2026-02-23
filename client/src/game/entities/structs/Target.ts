import { Scene } from "phaser";
import HitStruct from "./HitStruct.ts";

export default class Target extends HitStruct {
	private static readonly BASE_LIFE = 1;
	private static readonly MAX_BLINK_INTERVAL = 800;
	private static readonly MIN_BLINK_INTERVAL = 90;
	private readonly timeRespawn: number;
	private respawnTimer: number;
	private blinkTimer: number;
	private isRespawning: boolean;

	constructor(scene: Scene, x: number, y: number, width: number, height: number) {
		super(scene, x, y, "yoshi", width, height, Target.BASE_LIFE);
		this.timeRespawn = 5000;
		this.respawnTimer = 0;
		this.blinkTimer = 0;
		this.isRespawning = false;
	}

	protected override preUpdate(time: number, delta: number): void {
		super.preUpdate(time, delta);

		if (this.isRespawning) {
			this.respawnTimer += delta;
			this.blinkTimer += delta;

			const progress = Math.min(this.respawnTimer / this.timeRespawn, 1);
			const blinkInterval = Phaser.Math.Linear(
				Target.MAX_BLINK_INTERVAL,
				Target.MIN_BLINK_INTERVAL,
				progress,
			);

			if (this.blinkTimer >= blinkInterval) {
				this.blinkTimer = 0;
				this.setVisible(!this.visible);
			}

			if (this.respawnTimer >= this.timeRespawn) {
				this.finishRespawn();
			}
		}
	}

	override setDamage(_damage: number): void {} // Asi no recibe daño al sincronizar con el server

	override onDeath(): void {
		if (this.isRespawning) return;

		this.isRespawning = true;
		this.respawnTimer = 0;
		this.blinkTimer = 0;
		this.setVisible(false);
		this.setAlpha(0.5);
		this.setBodyEnabled(false);
	}

	override onSyncServer(): void {
		if (!this.isRespawning) {
			this.setVisible(true);
		}
	}

	private finishRespawn(): void {
		this.isRespawning = false;
		this.respawnTimer = 0;
		this.blinkTimer = 0;
		this.setVisible(true);
		this.setAlpha(1);
		this.setBodyEnabled(true);
	}

	private setBodyEnabled(enabled: boolean): void {
		if (!this.body) return;
		const body = this.body as Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody;
		body.enable = enabled;
	}
}
