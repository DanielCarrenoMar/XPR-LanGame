import { BaseProyectil } from "./BaseProyectil.ts";
import Portal from "#entities/structs/Portal.ts";

export default class PortalBullet extends BaseProyectil {
    private static readonly SPEED = 530;
    private static readonly DECELERATION = 620;
    private static readonly STOP_THRESHOLD = 10;
    private static readonly MAX_LIFETIME = 1200;

    private readonly targetPortal: Portal;
    private timer = 0;
    private finished = false;

    constructor(scene: Phaser.Scene, x: number, y: number, angle: number, ownerId: number | null, targetPortal: Portal) {
        const velocity = new Phaser.Math.Vector2(Math.cos(angle), Math.sin(angle)).scale(PortalBullet.SPEED);
        super(scene, x, y, velocity, "PORTAL_BULLET", ownerId);

        this.targetPortal = targetPortal;
        this.setRadius(7);
        this.setFillStyle(0x8ec5ff, 1);
    }

    protected preUpdate(): void {
        super.preUpdate();
        if (!this.body || this.finished) {
            return;
        }

        this.timer += this.scene.game.loop.delta;

        const body = this.body as Phaser.Physics.Arcade.Body;
        const velocity = body.velocity;
        const currentSpeed = velocity.length();
        const deltaSeconds = this.scene.game.loop.delta / 1000;
        const nextSpeed = Math.max(0, currentSpeed - PortalBullet.DECELERATION * deltaSeconds);

        if (currentSpeed > 0) {
            velocity.scale(nextSpeed / currentSpeed);
        }

        if (nextSpeed <= PortalBullet.STOP_THRESHOLD || this.timer >= PortalBullet.MAX_LIFETIME) {
            this.finishAndCreatePortal();
        }
    }

    private finishAndCreatePortal(): void {
        if (this.finished || !this.active) {
            return;
        }

        this.finished = true;
        this.targetPortal.placeAt(this.x, this.y);
        this.destroy();
    }
}