export default abstract class BaseWeapon extends Phaser.GameObjects.Sprite {
    protected ownerId: number;

    constructor(scene: Phaser.Scene, x: number, y: number, ownerId: number, texture: string = "yoshi") {
        super(scene, x, y, texture);
        this.setDisplaySize(32, 32);
        scene.add.existing(this);
        this.ownerId = ownerId;
    }

    abstract fire(playerPos: Readonly<Phaser.Math.Vector2>, targetPos: Readonly<Phaser.Math.Vector2>): void;
}