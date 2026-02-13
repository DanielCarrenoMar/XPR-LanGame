export default abstract class BaseWeapon extends Phaser.GameObjects.Sprite {
    protected ownerId: number | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string = "yoshi") {
        super(scene, x, y, texture);
        this.setDisplaySize(32, 32);
        scene.add.existing(this);
    }

    setOwnerId(id: number | null): void {
        this.ownerId = id;
    }

    abstract fire(playerPos: Readonly<Phaser.Math.Vector2>, targetPos: Readonly<Phaser.Math.Vector2>): void;
}