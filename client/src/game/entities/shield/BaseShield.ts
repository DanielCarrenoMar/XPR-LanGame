export default abstract class BaseShield extends Phaser.GameObjects.Rectangle {
    protected ownerId: number | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, width: number = 64, height: number = 64) {
        super(scene, x, y);
        this.setDisplaySize(width, height);
        scene.add.existing(this);
        scene.physics.add.existing(this, true);
        this.scene.events.emit("shield-created", this);

        //const body = this.body as Phaser.Physics.Arcade.StaticBody;
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
