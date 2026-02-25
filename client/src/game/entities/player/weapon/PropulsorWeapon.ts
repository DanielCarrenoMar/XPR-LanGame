import BaseWeapon from "./BaseWeapon.ts";
import type { BasePlayer } from "../BasePlayer.ts";

export default class PropulsorWeapon extends BaseWeapon {
    private readonly impulseForce = 160;

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "shotgun", 0);
    }

    
    private applyShotImpulse(direction: Readonly<Phaser.Math.Vector2>, force: number): void {
        if (force <= 0) {
            return;
        }

        const impulseDirection = new Phaser.Math.Vector2(direction.x, direction.y);
        if (impulseDirection.lengthSq() === 0) {
            return;
        }

        const playerBody = this.player.body as Phaser.Physics.Arcade.Body | undefined;
        if (!playerBody) {
            return;
        }

        const impulse = impulseDirection.normalize().scale(force);
        playerBody.setVelocity(playerBody.velocity.x + impulse.x, playerBody.velocity.y + impulse.y);
    }

    protected doFire(targetPos: Readonly<Phaser.Math.Vector2>): void {
        const oppositeDirection = new Phaser.Math.Vector2(this.player.x - targetPos.x, this.player.y - targetPos.y);
        this.applyShotImpulse(oppositeDirection, this.impulseForce);
    }
}