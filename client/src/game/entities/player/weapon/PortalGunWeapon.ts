import PortalBullet from "#entities/proyectil/PortalBullet.ts";
import Portal from "#entities/structs/Portal.ts";
import type { BasePlayer } from "../BasePlayer.ts";
import BaseWeapon from "./BaseWeapon.ts";

export default class PortalGunWeapon extends BaseWeapon {
    private readonly primaryPortal: Portal;
    private readonly secondPortal: Portal;
    private nextPortalToAssign = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "shotgun", 220);

        const ramdonColor = [0xFF0000,
            0xFF7F00,
            0xFFFF00,
            0x7FFF00,
            0x00FF00,
            0x00FF7F,
            0x00FFFF,
            0x007FFF,
            0x0000FF,
            0x7F00FF,
            0xFF00FF,
            0xFF007F][Math.floor(Math.random() * 2)];

        this.primaryPortal = new Portal(scene, -2000, -2000, ramdonColor);
        this.secondPortal = new Portal(scene, -2000, -2000, ramdonColor);

        this.primaryPortal.setLinkedPortal(this.secondPortal);
        this.secondPortal.setLinkedPortal(this.primaryPortal);
    }

    protected doFire(targetPos: Readonly<Phaser.Math.Vector2>): void {
        const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, targetPos.x, targetPos.y);
        const portalToAssign = this.nextPortalToAssign === 0 ? this.primaryPortal : this.secondPortal;

        new PortalBullet(this.scene, this.player.x, this.player.y, angle, this.ownerId, portalToAssign);
        this.nextPortalToAssign = this.nextPortalToAssign === 0 ? 1 : 0;
    }

    override destroy(fromScene?: boolean): void {
        this.primaryPortal.destroy();
        this.secondPortal.destroy();
        super.destroy(fromScene);
    }
}