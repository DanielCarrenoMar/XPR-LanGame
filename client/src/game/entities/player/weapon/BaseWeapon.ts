export default abstract class BaseWeapon extends Phaser.GameObjects.Sprite {

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string = "yoshi") {
        super(scene, x, y, texture);
        this.setDisplaySize(32, 32);
        scene.add.existing(this);
    }

    abstract fire(playerPos: Readonly<Phaser.Math.Vector2>, targetPos: Readonly<Phaser.Math.Vector2>): void;
}