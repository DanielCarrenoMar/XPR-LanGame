export default abstract class BaseBullet extends Phaser.GameObjects.Arc
{
    public velocity: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2) {
        super(scene, x, y, 4, 0, 360, false, 0xff0000);
        this.velocity = velocity;
        scene.add.existing(this);
    }
}