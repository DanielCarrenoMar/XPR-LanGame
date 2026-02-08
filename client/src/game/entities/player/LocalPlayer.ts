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

    constructor(
        scene: Scene,
        x: number,
        y: number,
    ) {
        super(scene, x, y, Modificable.frontModule, Modificable.backModule);

        this.speed = 220;
        this.keys = scene.input.keyboard?.addKeys('W,A,S,D') as WasdKeys | null;

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
    }

    private handleShoot(pointer: Phaser.Input.Pointer): void {
        if (pointer.button !== 0) {
            return;
        }
        const playerPos = new PhaserMath.Vector2(this.x, this.y);
        const targetPos = pointer.positionToCamera(this.scene.cameras.main) as PhaserMath.Vector2;
        const targetMirror = targetPos.clone().subtract(playerPos).scale(-1).add(playerPos);

        this.frontWeapon?.fire(playerPos, targetPos);
        this.backWeapon?.fire(playerPos, targetMirror);
    }

}
