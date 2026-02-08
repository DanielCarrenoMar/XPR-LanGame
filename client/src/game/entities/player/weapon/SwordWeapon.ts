import BaseWeapon from "./BaseWeapon.ts";

type MeleeHitbox = Phaser.GameObjects.Arc & { ownerId: number | null };

export default class SwordWeapon extends BaseWeapon {
    private isSwinging = false;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
    }

    fire(playerPos: Phaser.Math.Vector2, targetPos: Phaser.Math.Vector2): void {
        if (this.isSwinging) return;

        this.isSwinging = true;

        const direction = targetPos.clone().subtract(playerPos).normalize();
        const reach = 32;
        const radius = 22;
        const hitX = playerPos.x + direction.x * reach;
        const hitY = playerPos.y + direction.y * reach;

        const hitbox = this.scene.add.circle(hitX, hitY, radius, 0xffffff, 0) as MeleeHitbox;
        hitbox.ownerId = this.ownerId;
        this.scene.physics.add.existing(hitbox);

        const body = hitbox.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setCircle(radius);
        body.setImmovable(true);
        body.setEnable(true);
        body.setVelocity(0, 0);

        this.scene.events.emit("melee-hitbox-created", hitbox);

        this.scene.time.delayedCall(180, () => {
            hitbox.destroy();
            this.isSwinging = false;
        });
    }
}