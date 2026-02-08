import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { ModuleType } from '#src/modificable.ts';
import BaseModule from './modules/BaseModule.ts';

type ShieldSet = { front?: GameObjects.Line; back?: GameObjects.Line };

type ShieldGeometry = {
    offset: number;
    halfLength: number;
    maxDistance: number;
};

export class BasePlayer extends GameObjects.Sprite
{
    protected frontModule: ModuleType;
    protected backModule: ModuleType;
    protected aimDot: GameObjects.Arc;
    protected shields: ShieldSet = {};
    protected moduleFront: BaseModule | null = null;
    protected moduleBack: BaseModule | null = null;
    public currentAimAngle = 0;

    private shieldGeom: ShieldGeometry = {
        offset: 30,
        halfLength: 25,
        maxDistance: 8
    };

    constructor(
        scene: Scene,
        x: number,
        y: number,
        color: number,
        frontModule: ModuleType,
        backModule: ModuleType,
        strokeColor = 0x0b1d4d
    ) {
        super(scene, x, y, "yoshi");
        this.setDisplaySize(64, 64);

        this.frontModule = frontModule;
        this.backModule = backModule;

        scene.add.existing(this);

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
        this.initShields();
        this.updateVisuals();
    }

    protected updateVisuals(): void {
        const aimDistance = this.width / 2;
        this.aimDot.x = this.x + Math.cos(this.currentAimAngle) * aimDistance;
        this.aimDot.y = this.y + Math.sin(this.currentAimAngle) * aimDistance;

        if (this.shields.front) {
            this.shields.front.x = this.x;
            this.shields.front.y = this.y;
            this.shields.front.setRotation(this.currentAimAngle);
        }
        if (this.shields.back) {
            this.shields.back.x = this.x;
            this.shields.back.y = this.y;
            this.shields.back.setRotation(this.currentAimAngle + Math.PI);
        }

        this.setRotation(this.currentAimAngle);

        const aimX = Math.cos(this.currentAimAngle) * 40;
        const aimY = Math.sin(this.currentAimAngle) * 40;

        this.moduleFront?.setPosition(this.x + aimX, this.y + aimY);
        this.moduleFront?.setRotation(this.currentAimAngle);

        this.moduleBack?.setPosition(this.x - aimX, this.y - aimY);
        this.moduleBack?.setRotation(this.currentAimAngle + Math.PI);
    }

    protected initShields(): void {
        if (this.frontModule === "SHIELD") {
            this.shields.front = this.createShieldLine();
        }
        if (this.backModule === "SHIELD") {
            this.shields.back = this.createShieldLine();
        }
    }

    private createShieldLine(): GameObjects.Line {
        const line = this.scene.add.line(this.x, this.y, this.shieldGeom.offset, -this.shieldGeom.halfLength, this.shieldGeom.offset, this.shieldGeom.halfLength, 0x00ffff);
        line.setLineWidth(4);
        return line;
    }

    public checkShieldCollision(bulletX: number, bulletY: number): boolean {
        if (this.frontModule === "SHIELD") {
            if (this.isPointNearShield(bulletX, bulletY, this.currentAimAngle)) {
                return true;
            }
        }

        if (this.backModule === "SHIELD") {
            if (this.isPointNearShield(bulletX, bulletY, this.currentAimAngle + Math.PI)) {
                return true;
            }
        }

        return false;
    }

    private isPointNearShield(bulletX: number, bulletY: number, angle: number): boolean {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        const perpX = -dirY;
        const perpY = dirX;

        const centerX = this.x + dirX * this.shieldGeom.offset;
        const centerY = this.y + dirY * this.shieldGeom.offset;

        const ax = centerX + perpX * this.shieldGeom.halfLength;
        const ay = centerY + perpY * this.shieldGeom.halfLength;
        const bx = centerX - perpX * this.shieldGeom.halfLength;
        const by = centerY - perpY * this.shieldGeom.halfLength;

        return this.isPointNearSegment(bulletX, bulletY, ax, ay, bx, by, this.shieldGeom.maxDistance);
    }

    private isPointNearSegment(
        px: number,
        py: number,
        ax: number,
        ay: number,
        bx: number,
        by: number,
        maxDistance: number
    ): boolean {
        const vx = bx - ax;
        const vy = by - ay;
        const wx = px - ax;
        const wy = py - ay;

        const c1 = wx * vx + wy * vy;
        if (c1 <= 0) {
            return PhaserMath.Distance.Between(px, py, ax, ay) <= maxDistance;
        }

        const c2 = vx * vx + vy * vy;
        if (c2 <= c1) {
            return PhaserMath.Distance.Between(px, py, bx, by) <= maxDistance;
        }

        const t = c1 / c2;
        const projX = ax + t * vx;
        const projY = ay + t * vy;
        return PhaserMath.Distance.Between(px, py, projX, projY) <= maxDistance;
    }

    override destroy(fromScene?: boolean): void {
        this.aimDot.destroy();
        this.shields.front?.destroy();
        this.shields.back?.destroy();
        super.destroy(fromScene);
    }
}
