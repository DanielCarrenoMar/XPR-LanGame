import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { BasePlayer } from './BasePlayer.ts';
import { Modificable, ModuleType } from '#src/modificable.ts';
import BaseModule from './modules/BaseModule.ts';
import ShotgunMod from './modules/ShotGunMod.ts';

type WasdKeys = {
    W: Input.Keyboard.Key;
    A: Input.Keyboard.Key;
    S: Input.Keyboard.Key;
    D: Input.Keyboard.Key;
};

export class LocalPlayer extends BasePlayer
{
    private keys: WasdKeys | null;
    private speed: number;
    public bullets: Array<{ sprite: GameObjects.Arc; velocity: PhaserMath.Vector2 }>;
    private bulletSpeed: number;
    private onShoot?: (x: number, y: number, angle: number) => void;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        onShoot?: (x: number, y: number, angle: number) => void
    ) {
        super(scene, x, y, Modificable.playerColor, Modificable.frontModule, Modificable.backModule, 0x0b1d4d);

        this.onShoot = onShoot;
        this.speed = 220;
        this.keys = scene.input.keyboard?.addKeys('W,A,S,D') as WasdKeys | null;
        this.bullets = [];
        this.bulletSpeed = 520;
        this.module1 = new ShotgunMod(scene, x, y);

        scene.input.on('pointerdown', this.handleShoot, this);
    }

    update(delta: number): void {
        if (!this.keys) {
            return;
        }

        const step = this.speed * (delta / 1000);
        let nextX = this.x;
        let nextY = this.y;

        if (this.keys.W.isDown) nextY -= step;
        if (this.keys.S.isDown) nextY += step;
        if (this.keys.A.isDown) nextX -= step;
        if (this.keys.D.isDown) nextX += step;

        this.x = nextX
        this.y = nextY
        
        const pointer = this.scene.input.activePointer;
        const pointerPosition = pointer.positionToCamera(this.scene.cameras.main) as PhaserMath.Vector2;
        
        this.currentAimAngle = PhaserMath.Angle.Between(this.x, this.y, pointerPosition.x, pointerPosition.y);

        this.updateVisuals();
        this.updateBullets(delta);
    }

    private handleShoot(pointer: Phaser.Input.Pointer): void {
        if (pointer.button !== 0) {
            return;
        }
        const playerPos = new PhaserMath.Vector2(this.x, this.y);
        const targetPos = pointer.positionToCamera(this.scene.cameras.main) as PhaserMath.Vector2;
        this.module1?.fire(playerPos, targetPos);
        this.module2?.fire(playerPos, targetPos);
    }

    private fireModule(moduleType: ModuleType, angle: number): void {
        if (moduleType === "SHOTGUN") {
            const spread = 0.2;
            const angles = [angle - spread, angle, angle + spread];

            angles.forEach((a) => {
                const bullet = this.scene.add.circle(this.x, this.y, 6, 0x9ad1ff);
                const velocity = new PhaserMath.Vector2(Math.cos(a), Math.sin(a)).scale(this.bulletSpeed);

                this.bullets.push({ sprite: bullet, velocity });
                this.onShoot?.(this.x, this.y, a);
            });
        } else if (moduleType === "PISTOL") {
            const bullet = this.scene.add.circle(this.x, this.y, 6, 0x9ad1ff);
            const velocity = new PhaserMath.Vector2(Math.cos(angle), Math.sin(angle)).scale(this.bulletSpeed);

            this.bullets.push({ sprite: bullet, velocity });
            this.onShoot?.(this.x, this.y, angle);
        }
    }

    private updateBullets(delta: number): void {
        const step = delta / 1000;
        const width = this.scene.scale.width;
        const height = this.scene.scale.height;

        for (let i = this.bullets.length - 1; i >= 0; i -= 1) {
            const bullet = this.bullets[i];
            bullet.sprite.x += bullet.velocity.x * step;
            bullet.sprite.y += bullet.velocity.y * step;

            if (
                bullet.sprite.x < -20 ||
                bullet.sprite.x > width + 20 ||
                bullet.sprite.y < -20 ||
                bullet.sprite.y > height + 20
            ) {
                bullet.sprite.destroy();
                this.bullets.splice(i, 1);
            }
        }
    }
}
