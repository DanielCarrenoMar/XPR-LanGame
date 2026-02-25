import { netClient } from "#sockets/netClient.ts";
import { createProyectil } from "#utils/factories.ts";
import BaseWeapon from "./BaseWeapon.ts";

export default class GrenadeWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "shotgun");
    }

    fire(playerPos: Phaser.Math.Vector2, targetPos: Phaser.Math.Vector2): void {
        const angle = Phaser.Math.Angle.Between(playerPos.x, playerPos.y, targetPos.x, targetPos.y);
        const playerId = netClient.getLocalPlayerId();

        if (!netClient.isConnected()) {
            createProyectil(this.scene, playerPos.x, playerPos.y, angle, "GRENADE", playerId);
        }

        netClient.sendFire(this.x, this.y, angle, "GRENADE");
    }
}