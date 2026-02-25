import { netClient } from "#sockets/netClient.ts";
import { createProyectil } from "#utils/factories.ts";
import BaseWeapon from "./BaseWeapon.ts";
import type { BasePlayer } from "../BasePlayer.ts";

export default class GrenadeWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "shotgun", 550);
    }

    protected doFire(targetPos: Readonly<Phaser.Math.Vector2>): void {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetPos.x, targetPos.y);
        const playerId = netClient.getLocalPlayerId();

        if (!netClient.isConnected()) {
            createProyectil(this.scene, this.player.x, this.player.y, angle, "GRENADE", playerId);
        }

        netClient.sendFire(this.player.x, this.player.y, angle, "GRENADE");
    }
}