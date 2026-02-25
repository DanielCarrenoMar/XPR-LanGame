import Shield from "#entities/shield/Shield.ts";
import BaseWeapon from "./BaseWeapon.ts";
import type { BasePlayer } from "../BasePlayer.ts";

export default class ShieldWeapon extends BaseWeapon {
    private shield: Shield;

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "shield", 0);
        this.shield = new Shield(scene, x, y);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        this.shield.setPosition(this.x, this.y);
        this.shield.syncBody();
    }

    override setOwnerId(id: number | null): void {
        super.setOwnerId(id);
        this.shield.setOwnerId(id);
    }

    override setActive(value: boolean): this {
        super.setActive(value);
        this.shield.setActive(value);
        this.shield.setVisible(value);
        return this;
    }

    protected doFire(_targetPos: Readonly<Phaser.Math.Vector2>): void {
        // Shields do not fire projectiles
    }

    override destroy(fromScene?: boolean): void {
        this.shield.destroy();
        super.destroy(fromScene);
    }
}