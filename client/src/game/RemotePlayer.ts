import { Scene } from 'phaser';
import { ModuleType } from '../modificable';
import { BasePlayer } from './BasePlayer';

export class RemotePlayer extends BasePlayer
{
    constructor(
        scene: Scene,
        x: number,
        y: number,
        color: number,
        frontModule: ModuleType,
        backModule: ModuleType
    ) {
        super(scene, x, y, color, frontModule, backModule, 0x243b2d);
    }

    applyRemoteState(x: number, y: number, angle: number): void {
        this.x = x;
        this.y = y;
        this.currentAimAngle = angle;
        this.updateVisuals();
    }
}
