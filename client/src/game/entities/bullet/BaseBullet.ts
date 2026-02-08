export type BulletType = "BULLET";

export abstract class BaseBullet extends Phaser.GameObjects.Arc
{
    public type: BulletType;
    public ownerId: number | null;
    public readonly spawnVelocity: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2, type: BulletType, ownerId: number | null) {
        super(scene, x, y, 4, 0, 360, false, 0xff0000);
        this.type = type;
        this.ownerId = ownerId;
        this.spawnVelocity = velocity.clone();
        scene.physics.add.existing(this);
        scene.add.existing(this);

        if (!this.body){
            console.error('Bullet physics body not found!');
            return;
        }

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setCircle(4);
        body.setVelocity(this.spawnVelocity.x, this.spawnVelocity.y);
    }
}