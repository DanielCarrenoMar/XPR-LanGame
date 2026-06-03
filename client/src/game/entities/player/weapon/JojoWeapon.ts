import Jojo from "#entities/proyectil/Jojo.ts";
import BaseWeapon from "./BaseWeapon.ts";
import type { BasePlayer } from "../BasePlayer.ts";

export default class JojoWeapon extends BaseWeapon {
    private readonly jojo: Jojo;
    private readonly idleReturnDelayMs = 130;
    private readonly maxDistanceFromPlayer = 250;
    private lastFireAt = Number.NEGATIVE_INFINITY;

    constructor(scene: Phaser.Scene, x: number, y: number, player: BasePlayer) {
        super(scene, x, y, player, "sword", 10);
        this.jojo = new Jojo(scene, this.x, this.y, this.ownerId);
    }

    protected preUpdate(time: number, delta: number): void {
        super.preUpdate(time, delta);

        if (!(this.scene.time.now - this.lastFireAt > this.idleReturnDelayMs)) return

        this.jojo.setTargetPosition(new Phaser.Math.Vector2(this.x, this.y));
        this.jojo.setDamageable(false);

    }

    protected doFire(targetPos: Readonly<Phaser.Math.Vector2>): void {
        this.lastFireAt = this.scene.time.now;
        this.jojo.setTargetPosition(this.clampTargetToPlayer(targetPos.x, targetPos.y));
        this.jojo.setDamageable(true);
    }

    private clampTargetToPlayer(targetX: number, targetY: number): Phaser.Math.Vector2 {
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const distance = Math.hypot(dx, dy);

        if (distance <= this.maxDistanceFromPlayer || distance === 0) {
            return new Phaser.Math.Vector2(targetX, targetY);
        }

        const scale = this.maxDistanceFromPlayer / distance;
        return new Phaser.Math.Vector2(
            this.player.x + dx * scale,
            this.player.y + dy * scale,
        );
    }

    override setOwnerId(id: number): void {
        super.setOwnerId(id);
        this.jojo.setOwnerId(id);
    }

    override setActive(value: boolean): this {
        super.setActive(value);
        this.jojo.setActive(value);
        this.jojo.setVisible(value);
        return this;
    }

    override destroy(fromScene?: boolean): void {
        this.jojo.destroy();
        super.destroy(fromScene);
    }
}
