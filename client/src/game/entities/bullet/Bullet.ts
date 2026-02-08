import {BaseBullet} from "./BaseBullet.ts";

export default class Bullet extends BaseBullet {
    private timer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number) {
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(300);
        super(scene, x, y, velocity, "BULLET");
    }

    preUpdate(...args: any[]): void {
        super.update(...args);

        this.x += this.velocity.x * (this.scene.game.loop.delta / 1000);
        this.y += this.velocity.y * (this.scene.game.loop.delta / 1000);

        this.timer += this.scene.game.loop.delta;
        if (this.timer > 200) {
            this.destroy();
        }
    }
}