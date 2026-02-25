import Bullet from "#entities/proyectil/Bullet.ts";
import { BaseBullet } from "./BaseBullet.ts";

export default class GrenadeBullet extends BaseBullet {
    private static readonly SPEED = 260;
    private static readonly DECELERATION = 520;
    private static readonly STOP_THRESHOLD = 180;
    private static readonly MAX_LIFETIME = 4000;
    private static readonly SHARD_COUNT = 8;

    private timer = 0;
    private exploded = false;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerId: number | null) {
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(GrenadeBullet.SPEED);
        super(scene, x, y, velocity, "GRENADE", ownerId);
        this.setRadius(6);
        this.setFillStyle(0xffaa00, 1);
        scene.events.emit("bullet-created", this);
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
        const nextSpeed = Math.max(0, currentSpeed - GrenadeBullet.DECELERATION * deltaSeconds);

        if (currentSpeed > 0) {
            velocity.scale(nextSpeed / currentSpeed);
        }

        if (nextSpeed <= GrenadeBullet.STOP_THRESHOLD || this.timer >= GrenadeBullet.MAX_LIFETIME) {
            //this.explode();
        }
    }

    private explode(): void {
        if (this.exploded || !this.active) {
            return;
        }

        this.exploded = true;
        const step = (Math.PI * 2) / GrenadeBullet.SHARD_COUNT;

        for (let i = 0; i < GrenadeBullet.SHARD_COUNT; i++) {
            const angle = i * step;
            new Bullet(this.scene, this.x, this.y, angle, this.ownerId);
        }

        this.destroy();
    }
}