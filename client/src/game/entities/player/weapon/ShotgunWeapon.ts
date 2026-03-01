import { createProyectil } from "#utils/factories.ts";
import BaseWeapon from "./BaseWeapon.ts";
import type { BasePlayer } from "../BasePlayer.ts";

export default class ShotgunWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "shotgun", 180);
    }

    protected doFire(targetPos: Readonly<Phaser.Math.Vector2>): void {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetPos.x, targetPos.y);
        const spread = 0.2;
        const angles = [angle - spread, angle, angle + spread];

        angles.forEach((a) => {
            createProyectil(this.scene, this.player.x, this.player.y, a, "BULLET", this.ownerId);
        });
    }
}