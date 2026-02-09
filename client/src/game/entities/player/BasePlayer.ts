import { GameObjects, Scene } from 'phaser';
import { WeaponType } from '#src/modificable.ts';
import { createWeapon } from '#utils/factories.ts';
import BaseWeapon from './weapon/BaseWeapon.ts';

export class BasePlayer extends GameObjects.Sprite
{
    protected frontWeapon: BaseWeapon | null = null;
    protected backWeapon: BaseWeapon | null = null;
    protected aimDot: GameObjects.Arc;
    protected playerIdText: GameObjects.Text;
    private playerId: number = -1;
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

        const body = this.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(320, 320);

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
        this.playerIdText = scene.add.text(x, y - 48, "", {
            fontFamily: "Arial",
            fontSize: "12px",
            color: "#ffffff"
        }).setOrigin(0.5, 0.5);
        this.updateVisuals();
    }

    public setPlayerId(id: number): void {
        this.playerId = id;
        this.playerIdText.setText(String(id));
    }

    public getPlayerId(): number {
        return this.playerId;
    }

    protected updateVisuals(): void {
        const aimDistance = this.width / 2;
        this.aimDot.x = this.x + Math.cos(this.currentAimAngle) * aimDistance;
        this.aimDot.y = this.y + Math.sin(this.currentAimAngle) * aimDistance;

        this.setRotation(this.currentAimAngle);

        const aimX = Math.cos(this.currentAimAngle) * 40;
        const aimY = Math.sin(this.currentAimAngle) * 40;

        this.frontWeapon?.setPosition(this.x + aimX, this.y + aimY);
        this.frontWeapon?.setRotation(this.currentAimAngle);

        this.backWeapon?.setPosition(this.x - aimX, this.y - aimY);
        this.backWeapon?.setRotation(this.currentAimAngle + Math.PI);
        this.playerIdText.setPosition(this.x, this.y - 48);
    }

    override destroy(fromScene?: boolean): void {
        this.aimDot.destroy();
        this.playerIdText.destroy();
        this.frontWeapon?.destroy();
        this.backWeapon?.destroy();
        super.destroy(fromScene);
    }
}
