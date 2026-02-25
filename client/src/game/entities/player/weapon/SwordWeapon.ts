import SwordMelee from "#entities/melee/SwordMelee.ts";
import BaseWeapon from "./BaseWeapon.ts";
import type { BasePlayer } from "../BasePlayer.ts";


export default class SwordWeapon extends BaseWeapon {
    private isSwinging = false;

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "sword", 200);
    }

    protected doFire(_targetPos: Readonly<Phaser.Math.Vector2>): void {
        if (this.isSwinging) return;
        const swordHitBox =  new SwordMelee(this.scene, this.player.x, this.player.y)
        this.isSwinging = true;

        this.scene.time.delayedCall(180, () => {
            swordHitBox.destroy();
            this.isSwinging = false;
        });
    }

}