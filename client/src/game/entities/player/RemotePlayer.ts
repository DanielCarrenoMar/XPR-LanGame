import { Scene } from 'phaser';
import { BasePlayer } from './BasePlayer.ts';
import { WeaponType } from '#src/modificable.ts';

export class RemotePlayer extends BasePlayer
{
    constructor(
        scene: Scene,
        x: number,
        y: number,
        frontModule: WeaponType,
        backModule: WeaponType
    ) {
        super(scene, x, y, frontModule, backModule);
        this.frontWeapon?.setActive(false)
        this.backWeapon?.setActive(false)
    }

    applyRemoteState(x: number, y: number, angle: number): void {
        this.x = x;
        this.y = y;
        this.currentAimAngle = angle;
        this.updateVisuals();
    }
}
