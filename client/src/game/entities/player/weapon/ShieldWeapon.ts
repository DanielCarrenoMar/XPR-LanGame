import Shield from "#entities/shield/Shield.ts";
import BaseWeapon from "./BaseWeapon.ts";

export default class ShieldWeapon extends BaseWeapon {
    private shield: Shield;

    constructor(scene: Phaser.Scene, x: number, y: number, ownerId: number) {
        super(scene, x, y, ownerId, "logo");
        this.shield = new Shield(scene, x, y, "logo");
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);
        this.shield.setPosition(this.x, this.y);
        this.shield.syncBody();
    }

    override setActive(value: boolean): this {
        super.setActive(value);
        this.shield.setActive(value);
        this.shield.setVisible(value);
        return this;
    }

    fire(): void {
        // Shields do not fire projectiles
    }

    override destroy(fromScene?: boolean): void {
        this.shield.destroy();
        super.destroy(fromScene);
    }
}