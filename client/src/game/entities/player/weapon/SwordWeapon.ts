import BaseWeapon from "./BaseWeapon.ts";


export default class SwordWeapon extends BaseWeapon {
    private isSwinging = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        //this.scene.events.emit("melee-hitbox-created", this);
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