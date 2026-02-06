import { GameObjects, Input, Math as PhaserMath, Scene } from 'phaser';
import { Modificable, ModuleType } from '../modificable';

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
    public bullets: Array<{ sprite: GameObjects.Arc; velocity: PhaserMath.Vector2 }>;
    private bulletSpeed: number;
    private onShoot?: (x: number, y: number, angle: number) => void;
    
    // New properties
    private shields: { front?: GameObjects.Line; back?: GameObjects.Line } = {};
    public currentAimAngle: number = 0;

    constructor (scene: Scene, x: number, y: number, onShoot?: (x: number, y: number, angle: number) => void)
    {
        super(scene, x, y, 20, 0, 360, false, Modificable.playerColor);
        
        this.onShoot = onShoot;
        scene.add.existing(this);

        this.speed = 220;
        this.keys = scene.input.keyboard?.addKeys('W,A,S,D') as WasdKeys | null;
        this.setStrokeStyle(2, 0x0b1d4d);

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
        this.bullets = [];
        this.bulletSpeed = 520;

        // Initialize Shields
        this.initShields();

        scene.input.on('pointerdown', this.handleShoot, this);
    }

    private initShields() {
        if (Modificable.frontModule === "SHIELD") {
            // Line perpendicular to direction
            // We create a line centered at 0,0 (relative) with offsets from (30, -25) to (30, 25)
            // But scene.add.line takes (x, y, x1, y1, x2, y2).
            // We'll set x,y to player pos initially.
            this.shields.front = this.scene.add.line(this.x, this.y, 30, -25, 30, 25, 0x00ffff);
            this.shields.front.setLineWidth(4);
        }
        if (Modificable.backModule === "SHIELD") {
            this.shields.back = this.scene.add.line(this.x, this.y, 30, -25, 30, 25, 0x00ffff);
            this.shields.back.setLineWidth(4);
        }
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

        if (this.keys.W.isDown) nextY -= step;
        if (this.keys.S.isDown) nextY += step;
        if (this.keys.A.isDown) nextX -= step;
        if (this.keys.D.isDown) nextX += step;

        const width = this.scene.scale.width;
        const height = this.scene.scale.height;
        const radius = this.radius;

        this.x = PhaserMath.Clamp(nextX, radius, width - radius);
        this.y = PhaserMath.Clamp(nextY, radius, height - radius);

        const pointer = this.scene.input.activePointer;
        this.currentAimAngle = PhaserMath.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        const aimDistance = this.radius + 10;

        this.aimDot.x = this.x + Math.cos(this.currentAimAngle) * aimDistance;
        this.aimDot.y = this.y + Math.sin(this.currentAimAngle) * aimDistance;

        // Update Shields
        if (this.shields.front) {
            this.shields.front.x = this.x;
            this.shields.front.y = this.y;
            this.shields.front.setRotation(this.currentAimAngle);
        }
        if (this.shields.back) {
            this.shields.back.x = this.x;
            this.shields.back.y = this.y;
            // Back shield is rotated 180 degrees offset from aim
            this.shields.back.setRotation(this.currentAimAngle + Math.PI);
        }

        this.updateBullets(delta);
    }

    private fireModule(moduleType: ModuleType, angle: number) {
        if (moduleType === "SHOTGUN") {
            const spread = 0.2; 
            const angles = [angle - spread, angle, angle + spread];

            angles.forEach(a => {
                const bullet = this.scene.add.circle(this.x, this.y, 6, 0x9ad1ff);
                const velocity = new PhaserMath.Vector2(Math.cos(a), Math.sin(a)).scale(this.bulletSpeed);

                this.bullets.push({ sprite: bullet, velocity });
                this.onShoot?.(this.x, this.y, a);
            });
        }
        else if (moduleType === "PISTOL") {
            const bullet = this.scene.add.circle(this.x, this.y, 6, 0x9ad1ff);
            const velocity = new PhaserMath.Vector2(Math.cos(angle), Math.sin(angle)).scale(this.bulletSpeed);

            this.bullets.push({ sprite: bullet, velocity });
            this.onShoot?.(this.x, this.y, angle);
        }
    }

    private handleShoot (pointer: Phaser.Input.Pointer)
    {
        if (pointer.button !== 0)
        {
            return;
        }

        // We calculate angle freshly to be precise with click
        const angle = PhaserMath.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);

        this.fireModule(Modificable.frontModule, angle);
        this.fireModule(Modificable.backModule, angle + Math.PI);
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

    public checkShieldCollision(bulletX: number, bulletY: number): boolean {
        // Distance check first (Shield radius is 30)
        const dist = PhaserMath.Distance.Between(this.x, this.y, bulletX, bulletY);
        if (dist < 20 || dist > 45) return false;

        const angleToBullet = PhaserMath.Angle.Between(this.x, this.y, bulletX, bulletY);

        if (this.shields.front) {
            const diff = PhaserMath.Angle.Wrap(angleToBullet - this.currentAimAngle);
            if (Math.abs(diff) < Math.PI / 4 + 0.2) return true;
        }

        if (this.shields.back) {
            const diff = PhaserMath.Angle.Wrap(angleToBullet - (this.currentAimAngle + Math.PI));
            if (Math.abs(diff) < Math.PI / 4 + 0.2) return true;
        }

        return false;
    }
}
