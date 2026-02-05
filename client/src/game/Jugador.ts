import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { Modificable } from '../modificable';

type WasdKeys = {
    W: Input.Keyboard.Key;
    A: Input.Keyboard.Key;
    S: Input.Keyboard.Key;
    D: Input.Keyboard.Key;
};

export class Jugador extends GameObjects.Arc
{
    private keys: WasdKeys | null;
    private speed: number;
    private aimDot: GameObjects.Arc;
    private bullets: Array<{ sprite: GameObjects.Arc; velocity: PhaserMath.Vector2 }>;
    private bulletSpeed: number;

    constructor (scene: Scene, x: number, y: number)
    {
        super(scene, x, y, 20, 0, 360, false, Modificable.playerColor);

        scene.add.existing(this);

        this.speed = 220;
        this.keys = scene.input.keyboard?.addKeys('W,A,S,D') as WasdKeys | null;
        this.setStrokeStyle(2, 0x0b1d4d);

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
        this.bullets = [];
        this.bulletSpeed = 520;

        scene.input.on('pointerdown', this.handleShoot, this);
    }

    update (delta: number)
    {
        if (!this.keys)
        {
            return;
        }

        const step = this.speed * (delta / 1000);
        let nextX = this.x;
        let nextY = this.y;

        if (this.keys.W.isDown)
        {
            nextY -= step;
        }
        if (this.keys.S.isDown)
        {
            nextY += step;
        }
        if (this.keys.A.isDown)
        {
            nextX -= step;
        }
        if (this.keys.D.isDown)
        {
            nextX += step;
        }

        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const radius = this.radius;

        this.x = PhaserMath.Clamp(nextX, radius, width - radius);
        this.y = PhaserMath.Clamp(nextY, radius, height - radius);

        const pointer = this.scene.input.activePointer;
        const angle = PhaserMath.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        const aimDistance = this.radius + 10;

        this.aimDot.x = this.x + Math.cos(angle) * aimDistance;
        this.aimDot.y = this.y + Math.sin(angle) * aimDistance;

        this.updateBullets(delta);
    }

    private handleShoot (pointer: Phaser.Input.Pointer)
    {
        if (pointer.button !== 0)
        {
            return;
        }

        const angle = PhaserMath.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        const bullet = this.scene.add.circle(this.x, this.y, 6, 0x9ad1ff);
        const velocity = new PhaserMath.Vector2(Math.cos(angle), Math.sin(angle)).scale(this.bulletSpeed);

        this.bullets.push({ sprite: bullet, velocity });
    }

    private updateBullets (delta: number)
    {
        const step = delta / 1000;
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        for (let i = this.bullets.length - 1; i >= 0; i -= 1)
        {
            const bullet = this.bullets[i];
            bullet.sprite.x += bullet.velocity.x * step;
            bullet.sprite.y += bullet.velocity.y * step;

            if (
                bullet.sprite.x < -20 ||
                bullet.sprite.x > width + 20 ||
                bullet.sprite.y < -20 ||
                bullet.sprite.y > height + 20
            )
            {
                bullet.sprite.destroy();
                this.bullets.splice(i, 1);
            }
        }
    }
}
