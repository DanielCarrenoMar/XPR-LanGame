import { GameObjects, Math as PhaserMath, Scene } from 'phaser';
import { WeaponType } from '#src/modificable.ts';
import { createWeapon } from '#utils/factories.ts';
import BaseWeapon from './weapon/BaseWeapon.ts';

type ShieldSet = { front?: GameObjects.Line; back?: GameObjects.Line };

type ShieldGeometry = {
    offset: number;
    halfLength: number;
    maxDistance: number;
};

export class BasePlayer extends GameObjects.Sprite
{
    protected frontWeapon: BaseWeapon | null = null;
    protected backWeapon: BaseWeapon | null = null;
    protected aimDot: GameObjects.Arc;
    protected shields: ShieldSet = {};
    public currentAimAngle = 0;
    
    constructor(
        scene: Scene,
        x: number,
        y: number,
        frontModule: WeaponType,
        backModule: WeaponType,
    ) {
        super(scene, x, y, "yoshi");
        this.setDisplaySize(64, 64);

        this.frontWeapon = createWeapon(scene, x, y, frontModule);
        this.backWeapon = createWeapon(scene, x, y, backModule);

        scene.physics.add.existing(this);
        scene.add.existing(this);

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
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

        this.frontWeapon?.setPosition(this.x + aimX, this.y + aimY);
        this.frontWeapon?.setRotation(this.currentAimAngle);

        this.backWeapon?.setPosition(this.x - aimX, this.y - aimY);
        this.backWeapon?.setRotation(this.currentAimAngle + Math.PI);
    }

    override destroy(fromScene?: boolean): void {
        this.aimDot.destroy();
        this.shields.front?.destroy();
        this.shields.back?.destroy();
        super.destroy(fromScene);
    }
}
