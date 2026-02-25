import { Input, Math as PhaserMath, Scene } from 'phaser';
import { BasePlayer } from './BasePlayer.ts';
import { Modificable } from '#src/modificable.ts';

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
    private readonly maxLives = 3;
    private lives = this.maxLives;

    constructor(
        scene: Scene,
        x: number,
        y: number,
        name: string
    ) {
        super(scene, x, y, Modificable.frontModule, Modificable.backModule, name);

        this.speed = 220;
        this.keys = scene.input.keyboard?.addKeys('W,A,S,D') as WasdKeys | null;
    }

    public getLives(): number {
        return this.lives;
    }

    public getMaxLives(): number {
        return this.maxLives;
    }

    public resetLives(): void {
        this.lives = this.maxLives;
    }

    override onHit(): void {
        if (this.isInvulnerable()) return;
        if (this.lives <= 0) return;
        this.lives -= 1;
        super.onHit();
    }

    update(delta: number): void {
        if (!this.keys) {
            return;
        }
        void delta;

        const body = this.body as Phaser.Physics.Arcade.Body;

        let vx = 0;
        let vy = 0;

        if (this.keys.W.isDown) vy -= 1;
        if (this.keys.S.isDown) vy += 1;
        if (this.keys.A.isDown) vx -= 1;
        if (this.keys.D.isDown) vx += 1;

        if (vx !== 0 || vy !== 0) {
            const vec = new PhaserMath.Vector2(vx, vy).normalize().scale(this.speed);
            body.setVelocity(vec.x, vec.y);
        } else {
            body.setVelocity(0, 0);
        }
        
        const pointer = this.scene.input.activePointer;
        const pointerPosition = pointer.positionToCamera(this.scene.cameras.main) as PhaserMath.Vector2;
        
        this.currentAimAngle = PhaserMath.Angle.Between(this.x, this.y, pointerPosition.x, pointerPosition.y);

        this.handleShoot(pointer);

        this.updateVisuals();
    }

    private handleShoot(pointer: Phaser.Input.Pointer): void {
        if (!pointer.isDown || !pointer.leftButtonDown()) {
            return;
        }
        const targetPos = pointer.positionToCamera(this.scene.cameras.main) as PhaserMath.Vector2;
        const playerPos = new PhaserMath.Vector2(this.x, this.y);
        const targetMirror = targetPos.clone().subtract(playerPos).scale(-1).add(playerPos);

        this.frontWeapon?.fire(targetPos);
        this.backWeapon?.fire(targetMirror);
    }

}
