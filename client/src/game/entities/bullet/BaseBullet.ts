export type BulletType = "BULLET";

export abstract class BaseBullet extends Phaser.GameObjects.Arc
{
    public type: BulletType;

    constructor(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2, type: BulletType) {
        super(scene, x, y, 4, 0, 360, false, 0xff0000);
        this.type = type;
        scene.physics.add.existing(this);
        scene.add.existing(this);

        if (!this.body){
            console.error('Bullet physics body not found!');
            return;
        }

        this.body.velocity.x = velocity.x;
        this.body.velocity.y = velocity.y;
    }
}