import BaseWeapon from "./BaseWeapon.ts";

export default class ShieldWeapon extends BaseWeapon {

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);

        const body = this.body as Phaser.Physics.Arcade.StaticBody;
        body.setCircle(18);
        body.setOffset(-18 + this.displayOriginX, -18 + this.displayOriginY);
        this.scene.events.emit("shield-created", this);
    }

    preUpdate(): void {
        const body = this.body as Phaser.Physics.Arcade.StaticBody | null;
        if (body) {
            body.updateFromGameObject();
        }
    }

    fire(): void {
        // Shields do not fire projectiles
    }
}