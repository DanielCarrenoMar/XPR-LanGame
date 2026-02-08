export type BulletType = "BULLET";

export abstract class BaseBullet extends Phaser.GameObjects.Arc
{
    public velocity: Phaser.Math.Vector2;
    public type: BulletType;

    constructor(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2, type: BulletType) {
        super(scene, x, y, 4, 0, 360, false, 0xff0000);
        this.type = type;
        this.velocity = velocity;
        scene.add.existing(this);
    }
}