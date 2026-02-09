import SwordMelee from "#entities/melee/SwordMelee.ts";
import BaseWeapon from "./BaseWeapon.ts";


export default class SwordWeapon extends BaseWeapon {
    private isSwinging = false;
    private swordMelee: SwordMelee;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.swordMelee = new SwordMelee(scene, x, y);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        this.swordMelee.setPosition(this.x, this.y);
    }

    fire(): void {
        if (this.isSwinging) return;
        const body = this.body as Phaser.Physics.Arcade.StaticBody;
        this.isSwinging = true;

        body.setSize(800, 800);

        this.scene.time.delayedCall(180, () => {
            body.setSize();
            this.isSwinging = false;
        });
    }
}