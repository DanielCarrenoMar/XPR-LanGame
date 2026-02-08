import {BaseBullet} from "./BaseBullet.ts";

export default class Bullet extends BaseBullet {
    private static readonly TIME = 2500;
    private timer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerId: number | null) {
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(300);
        super(scene, x, y, velocity, "BULLET", ownerId);
    }

    preUpdate(): void {
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