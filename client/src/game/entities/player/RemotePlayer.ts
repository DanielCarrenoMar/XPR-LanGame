import { Math as PhaserMath, Scene } from 'phaser';
import { BasePlayer } from './BasePlayer.ts';
import { PlayerState } from '#sockets/types.ts';

export class RemotePlayer extends BasePlayer
{
    private targetX: number;
    private targetY: number;
    private targetAngle: number;
    private readonly interpSpeed = 12;
    private readonly snapDistance = 200;

    constructor(
        scene: Scene,
        playerState: PlayerState
    ) {
        super(scene, playerState.x, playerState.y, playerState.frontModule, playerState.backModule, playerState.name);
        this.targetX = playerState.x;
        this.targetY = playerState.y;
        this.targetAngle = playerState.angle;
    }

    applyRemoteState(x: number, y: number, angle: number): void {
        this.targetX = x;
        this.targetY = y;
        this.currentAimAngle = angle

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        if (Math.hypot(dx, dy) > this.snapDistance) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.currentAimAngle = this.targetAngle;
            this.updateVisuals();
        }
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        const t = Math.min(1, (delta / 1000) * this.interpSpeed);
        this.x = PhaserMath.Linear(this.x, this.targetX, t);
        this.y = PhaserMath.Linear(this.y, this.targetY, t);

        this.updateVisuals();
    }
}
