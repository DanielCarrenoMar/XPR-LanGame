import { createdEvents } from "#utils/eventsDefinitions.ts";
import {BaseProyectil} from "./BaseProyectil.ts";

export default class Bullet extends BaseProyectil {
    private static readonly TIME = 2500;
    private timer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerId: number | null) {
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(500);
        super(scene, x, y, velocity, "BULLET", ownerId);
        scene.events.emit(createdEvents.BULLET_CREATED, this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setVelocity(this.spawnVelocity.x, this.spawnVelocity.y);
    }

    preUpdate(): void {
        super.preUpdate();
        this.timer += this.scene.game.loop.delta;

        if (this.body) {
            const velocity = this.body.velocity as Phaser.Math.Vector2;
            const t = Math.min(this.timer / (Bullet.TIME + 3000), 1);
            const ease = 1 - Math.pow(t, 4);
            velocity.scale(ease);
        }

        if (this.timer > Bullet.TIME) {
            this.destroy();
        }
    }
}