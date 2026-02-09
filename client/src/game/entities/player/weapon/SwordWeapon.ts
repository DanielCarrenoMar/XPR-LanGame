import SwordMelee from "#entities/melee/SwordMelee.ts";
import BaseWeapon from "./BaseWeapon.ts";


export default class SwordWeapon extends BaseWeapon {
    private isSwinging = false;
    private swordMelee: SwordMelee;

    constructor(scene: Phaser.Scene, x: number, y: number, ownerId: number) {
        super(scene, x, y, ownerId);
        this.swordMelee = new SwordMelee(scene, x, y, this.ownerId);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        this.swordMelee.setPosition(this.x, this.y);
    }

    override setActive(value: boolean): this {
        super.setActive(value);
        this.swordMelee.setActive(value);
        return this;
    }

    fire(): void {
        if (this.isSwinging) return;
        const body = this.swordMelee.body as Phaser.Physics.Arcade.StaticBody;
        this.isSwinging = true;

        body.setSize(64, 64);

        this.scene.time.delayedCall(180, () => {
            body.setSize();
            this.isSwinging = false;
        });
    }

    override destroy(fromScene?: boolean): void {
        this.swordMelee.destroy();
        super.destroy(fromScene);
    }
}