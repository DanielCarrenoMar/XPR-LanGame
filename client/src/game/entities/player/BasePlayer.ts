import { GameObjects, Scene } from 'phaser';
import { WeaponType } from '#src/modificable.ts';
import { createWeapon } from '#utils/factories.ts';
import BaseWeapon from './weapon/BaseWeapon.ts';

export class BasePlayer extends GameObjects.Sprite
{
    private readonly defaultTextureKey = "default";
    private readonly blinkTextureKey = "parpadeo";
    private readonly blinkMinIntervalMs = 3000;
    private readonly blinkMaxIntervalMs = 10000;
    private readonly blinkDurationMs = 120;
    protected frontWeapon: BaseWeapon | null = null;
    protected backWeapon: BaseWeapon | null = null;
    protected backAccessory: GameObjects.Image | null = null;
    protected aimDot: GameObjects.Arc;
    protected playerIdText: GameObjects.Text;
    private playerId: number = -1;
    public currentAimAngle = 0;
    private readonly backAccessoryOffset = 1;
    
    constructor(
        scene: Scene,
        x: number,
        y: number,
        frontModule: WeaponType,
        backModule: WeaponType,
    ) {
        super(scene, x, y, "default");
        this.setDisplaySize(130, 130);

        this.frontWeapon = createWeapon(scene, x, y, frontModule);
        this.backWeapon = createWeapon(scene, x, y, backModule);

        scene.physics.add.existing(this);
        scene.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.StaticBody;
        body.setCircle(75, 170, 170);

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
        this.playerIdText = scene.add.text(x, y - 48, "", {
            fontFamily: "Arial",
            fontSize: "12px",
            color: "#ffffff"
        }).setOrigin(0.5, 0.5);
        this.backAccessory = this.backWeapon ? scene.add.image(x, y, "conejo") : null;
        this.backAccessory?.setDisplaySize(128, 128);
        this.startBlinkLoop();
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
        const backX = Math.cos(this.currentAimAngle) * this.backAccessoryOffset;
        const backY = Math.sin(this.currentAimAngle) * this.backAccessoryOffset;

        this.frontWeapon?.setPosition(this.x + aimX, this.y + aimY);
        this.frontWeapon?.setRotation(this.currentAimAngle);

        this.backWeapon?.setPosition(this.x - aimX, this.y - aimY);
        this.backWeapon?.setRotation(this.currentAimAngle + Math.PI);
        if (this.backWeapon) {
            if (!this.backAccessory) {
                this.backAccessory = this.scene.add.image(this.x, this.y, "conejo");
                this.backAccessory.setDisplaySize(64, 64);
            }
            this.backAccessory.setPosition(this.x - backX, this.y - backY);
            this.backAccessory.setRotation(this.currentAimAngle);
        } else if (this.backAccessory) {
            this.backAccessory.destroy();
            this.backAccessory = null;
        }
        this.playerIdText.setPosition(this.x, this.y - 48);
    }

    override destroy(fromScene?: boolean): void {
        this.aimDot.destroy();
        this.playerIdText.destroy();
        this.frontWeapon?.destroy();
        this.backWeapon?.destroy();
        this.backAccessory?.destroy();
        super.destroy(fromScene);
    }

    private startBlinkLoop(): void {
        const scheduleNextBlink = (): void => {
            const delay = Phaser.Math.Between(this.blinkMinIntervalMs, this.blinkMaxIntervalMs);
            this.scene.time.delayedCall(delay, () => {
                if (!this.active) {
                    return;
                }
                this.setTexture(this.blinkTextureKey);
                this.scene.time.delayedCall(this.blinkDurationMs, () => {
                    if (this.active) {
                        this.setTexture(this.defaultTextureKey);
                        scheduleNextBlink();
                    }
                });
            });
        };

        scheduleNextBlink();
    }
}

