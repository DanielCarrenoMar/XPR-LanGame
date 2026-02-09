import BaseWeapon from "./BaseWeapon.ts";

export default class ShieldWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, "logo");
        this.scene.events.emit("shield-created", this);
    }

    fire(): void {
        // Shields do not fire projectiles
    }
}