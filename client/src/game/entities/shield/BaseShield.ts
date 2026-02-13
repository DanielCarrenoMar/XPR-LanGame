export default abstract class BaseShield extends Phaser.GameObjects.Sprite {
    protected ownerId: number | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, width: number = 64, height: number = 64) {
        super(scene, x, y, texture);
        this.setDisplaySize(width, height);
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.scene.events.emit("shield-created", this);

        const body = this.body as Phaser.Physics.Arcade.StaticBody | null;
        if (body) {
            body.setSize(width, height, true);
        }
    }

    setOwnerId(id: number | null): void {
        this.ownerId = id;
    }

    syncBody(): void {
        const body = this.body as Phaser.Physics.Arcade.StaticBody | null;
        if (body) {
            body.updateFromGameObject();
        }
    }
}
