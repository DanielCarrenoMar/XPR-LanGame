import OnHitInterface from "#entities/OnHitInterface.ts";
import { createdEvents } from "#utils/eventsDefinitions.ts";

export default abstract class BaseMelee extends Phaser.GameObjects.Sprite implements OnHitInterface {
    private hitDelay: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, hitDelay: number = 180) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.scene.events.emit(createdEvents.MELEE_CREATED, this);
        this.hitDelay = hitDelay;
    }

    onHit(): void {
        this.setActive(false);

        this.scene.time.delayedCall(this.hitDelay, () => {
            this.setActive(true);
        });
    }
}