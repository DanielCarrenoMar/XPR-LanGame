import OnHitInterface from "#entities/DamageEntityInterface.ts";
import { createdEvents } from "#utils/eventsDefinitions.ts";
import { BaseProyectil } from "./BaseProyectil.ts";

export default class Jojo extends BaseProyectil implements OnHitInterface {
    private static readonly INTERPOLATION_SPEED = 850;
    private targetPosition: Phaser.Math.Vector2;
    private static readonly HITDELAY = 300;

    constructor(scene: Phaser.Scene, x: number, y: number, ownerId: number | null) {
        super(scene, x, y, new Phaser.Math.Vector2(0, 0), "JOJO", ownerId);
        this.setRadius(10);
        this.setFillStyle(0x9f7aea, 1);
        this.targetPosition = new Phaser.Math.Vector2(x, y);

        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setCircle(10);
        body.setVelocity(0, 0);

        scene.events.emit(createdEvents.MELEE_CREATED, this);
    }

    onHit(): void {
        this.setDamageable(false);

        this.scene.time.delayedCall(Jojo.HITDELAY, () => {
            this.setDamageable(true);
        });
    }

    setTargetPosition(targetPos: Readonly<Phaser.Math.Vector2>): void {
        this.targetPosition.set(targetPos.x, targetPos.y);
    }

    preUpdate(): void {
        super.preUpdate();

        if (!this.body) {
            return;
        }

        const body = this.body as Phaser.Physics.Arcade.Body;
        const deltaSeconds = this.scene.game.loop.delta / 1000;
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetPosition.x, this.targetPosition.y);

        if (distance <= 0.001) {
            body.reset(this.targetPosition.x, this.targetPosition.y);
            body.setVelocity(0, 0);
            return;
        }

        const maxStep = Jojo.INTERPOLATION_SPEED * deltaSeconds;
        const t = Phaser.Math.Clamp(maxStep / distance, 0, 1);

        this.x = Phaser.Math.Linear(this.x, this.targetPosition.x, t);
        this.y = Phaser.Math.Linear(this.y, this.targetPosition.y, t);

        body.reset(this.x, this.y);
        body.setVelocity(0, 0);
    }
}
