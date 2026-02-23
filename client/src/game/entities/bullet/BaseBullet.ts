export type BulletType = "BULLET";

export abstract class BaseBullet extends Phaser.GameObjects.Arc
{
    private static readonly TRAIL_DOTS = 16;
    private static readonly TRAIL_SPACING = 3;
    private static readonly TRAIL_ALPHA = 0.45;

    public type: BulletType;
    public ownerId: number;
    public readonly spawnVelocity: Phaser.Math.Vector2;
    private trailDots: Phaser.GameObjects.Arc[] = [];
    private trailPositions: Phaser.Math.Vector2[] = [];
    private lastTrailSample: Phaser.Math.Vector2;

    constructor(scene: Phaser.Scene, x: number, y: number, velocity: Phaser.Math.Vector2, type: BulletType, ownerId: number | null) {
        super(scene, x, y, 4, 0, 360, false, 0xff0000);
        this.type = type;
        this.ownerId = ownerId ?? -1;
        this.spawnVelocity = velocity.clone();
        scene.physics.add.existing(this);
        scene.add.existing(this);
        this.depth = 1;

        if (!this.body){
            console.error('Bullet physics body not found!');
            return;
        }

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(false);
        body.setCircle(4);
        body.setVelocity(this.spawnVelocity.x, this.spawnVelocity.y);

        this.initTrail();
        this.lastTrailSample = new Phaser.Math.Vector2(this.x, this.y);
    }

    protected preUpdate(): void {
        this.updateTrail();
    }

    private initTrail(): void {
        for (let i = 0; i < BaseBullet.TRAIL_DOTS; i++) {
            const alpha = BaseBullet.TRAIL_ALPHA * (1 - i / BaseBullet.TRAIL_DOTS);
            const dot = this.scene.add.arc(this.x, this.y, this.radius, this.fillColor, alpha);
            dot.setDepth(this.depth - 1);
            dot.setVisible(false);
            this.trailDots.push(dot);
        }
    }

    protected updateTrail(): void {
        if (!this.body) {
            return;
        }

        let distanceToCurrent = Phaser.Math.Distance.Between(
            this.lastTrailSample.x,
            this.lastTrailSample.y,
            this.x,
            this.y,
        );

        while (distanceToCurrent >= BaseBullet.TRAIL_SPACING) {
            const direction = new Phaser.Math.Vector2(
                this.x - this.lastTrailSample.x,
                this.y - this.lastTrailSample.y,
            ).normalize();

            this.lastTrailSample = this.lastTrailSample
                .clone()
                .add(direction.scale(BaseBullet.TRAIL_SPACING));

            this.trailPositions.unshift(this.lastTrailSample.clone());
            if (this.trailPositions.length > this.trailDots.length) {
                this.trailPositions.length = this.trailDots.length;
            }

            distanceToCurrent = Phaser.Math.Distance.Between(
                this.lastTrailSample.x,
                this.lastTrailSample.y,
                this.x,
                this.y,
            );
        }

        for (let i = 0; i < this.trailDots.length; i++) {
            const dot = this.trailDots[i];
            const trailPos = this.trailPositions[i];

            if (!trailPos) {
                dot.setVisible(false);
                continue;
            }

            const alpha = BaseBullet.TRAIL_ALPHA * (1 - i / this.trailDots.length);

            dot.setVisible(true);
            dot.setPosition(trailPos.x, trailPos.y);
            dot.setFillStyle(this.fillColor, alpha);
        }
    }

    override destroy(fromScene?: boolean): void {
        for (const dot of this.trailDots) {
            dot.destroy();
        }

        this.trailDots.length = 0;
        super.destroy(fromScene);
    }
}