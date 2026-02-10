import SwordMelee from "#entities/melee/SwordMelee.ts";
import BaseWeapon from "./BaseWeapon.ts";


export default class SwordWeapon extends BaseWeapon {
    private isSwinging = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "sword");
    }

    fire(): void {
        if (this.isSwinging) return;
        const swordHitBox =  new SwordMelee(this.scene, this.x, this.y)
        this.isSwinging = true;

        this.scene.time.delayedCall(180, () => {
            swordHitBox.destroy();
            this.isSwinging = false;
        });
    }

}