export default abstract class BaseMelee extends Phaser.GameObjects.Sprite {
    private hitDelay: number;
    private ownerId: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, ownerId: number, hitDelay: number = 180) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene.events.emit("melee-created", this);
        this.hitDelay = hitDelay;
        this.ownerId = ownerId;
    }

    getOwnerId(): number {
        return this.ownerId;
    }

    onHit(): void {
        this.setActive(false);

        this.scene.time.delayedCall(this.hitDelay, () => {
            this.setActive(true);
        });
    }
}