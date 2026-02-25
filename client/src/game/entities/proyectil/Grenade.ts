import Bullet from "#entities/proyectil/Bullet.ts";
import { BaseProyectil } from "./BaseProyectil.ts";

export default class Grenade extends BaseProyectil {
    private static readonly SPEED = 260;
    private static readonly DECELERATION = 320;
    private static readonly STOP_THRESHOLD = 10;
    private static readonly MAX_LIFETIME = 4000;
    private static readonly SHARD_COUNT = 8;

    private timer = 0;
    private exploded = false;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerId: number | null) {
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(Grenade.SPEED);
        super(scene, x, y, velocity, "GRENADE", ownerId);
        this.setRadius(6);
        this.setFillStyle(0xffaa00, 1);
    }

    preUpdate(): void {
        super.preUpdate();
        if (!this.body || this.exploded) {
            return;
        }

        this.timer += this.scene.game.loop.delta;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const velocity = body.velocity;
        const currentSpeed = velocity.length();
        const deltaSeconds = this.scene.game.loop.delta / 1000;
        const nextSpeed = Math.max(0, currentSpeed - Grenade.DECELERATION * deltaSeconds);

        if (currentSpeed > 0) {
            velocity.scale(nextSpeed / currentSpeed);
        }

        if (nextSpeed <= Grenade.STOP_THRESHOLD || this.timer >= Grenade.MAX_LIFETIME) {
            this.explode();
        }
    }

    private explode(): void {
        if (this.exploded || !this.active) {
            return;
        }

        this.exploded = true;
        const step = (Math.PI * 2) / Grenade.SHARD_COUNT;

        for (let i = 0; i < Grenade.SHARD_COUNT; i++) {
            const angle = i * step;
            new Bullet(this.scene, this.x, this.y, angle, this.ownerId);
        }

        this.destroy();
    }
}