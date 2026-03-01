import OnHitInterface from "#entities/DamageEntityInterface.ts";
import DamageEntityState from "#entities/DamageEntityState.ts";
import { createdEvents } from "#utils/eventsDefinitions.ts";

export default abstract class BaseMelee extends Phaser.GameObjects.Sprite implements OnHitInterface {
    private hitDelay: number;
    private damageState: DamageEntityState;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, ownerId: number = -1, hitDelay: number = 180) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene.events.emit(createdEvents.MELEE_CREATED, this);
        this.hitDelay = hitDelay;
        this.damageState = new DamageEntityState(ownerId, true);
    }

    onHit(): void {
        this.setDamageable(false);

        this.scene.time.delayedCall(this.hitDelay, () => {
            this.setDamageable(true);
        });
    }

    public getOwnerId(): number {
        return this.damageState.getOwnerId();
    }

    public setOwnerId(id: number): void {
        this.damageState.setOwnerId(id);
    }

    public isDamageable(): boolean {
        return this.damageState.isDamageable();
    }

    public setDamageable(isDamageable: boolean): void {
        this.damageState.setDamageable(isDamageable);
    }
}