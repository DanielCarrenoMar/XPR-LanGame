import type { BasePlayer } from "#player/BasePlayer.ts";
import { netClient } from "#sockets/netClient.ts";

export default abstract class BaseWeapon extends Phaser.GameObjects.Sprite {
    protected ownerId: number | null = null;
    protected readonly player: BasePlayer;
    private readonly cooldownMs: number;
    private nextShotAt = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer, texture: string = "yoshi", cooldownMs = 0) {
        super(scene, x, y, texture);
        this.player = player;
        this.cooldownMs = cooldownMs;
        this.setDisplaySize(32, 32);
        scene.add.existing(this);
    }

    setOwnerId(id: number | null): void {
        this.ownerId = id;
    }

    isLocalPlayerWeapon(): boolean {
        return this.ownerId === netClient.getLocalPlayerId()
    }

    fire(targetPos: Readonly<Phaser.Math.Vector2>): void {
        if (!this.canFireNow()) {
            return;
        }

        this.startCooldown();
        this.doFire(targetPos);
    }

    private canFireNow(): boolean {
        return this.scene.time.now >= this.nextShotAt;
    }

    private startCooldown(): void {
        this.nextShotAt = this.scene.time.now + this.cooldownMs;
    }

    protected abstract doFire(targetPos: Readonly<Phaser.Math.Vector2>): void;
}