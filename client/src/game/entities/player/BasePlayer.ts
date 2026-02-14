import { GameObjects, Scene } from 'phaser';
import { WeaponType } from '#src/modificable.ts';
import { createWeapon } from '#utils/factories.ts';
import BaseWeapon from './weapon/BaseWeapon.ts';

export class BasePlayer extends GameObjects.Sprite
{
    private readonly defaultTextureKey = "player";
    private readonly blinkTextureKey = "player_blink";
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
    private readonly weaponBobAmplitude = 2.5;
    private readonly weaponBobFrequency = 0.01;
    private readonly movementThresholdPx = 0.1;
    private weaponBobTime = 0;
    private readonly weaponBobDirectionX: number;
    private readonly weaponBobDirectionY: number;
    private previousX: number;
    private previousY: number;
    
    constructor(
        scene: Scene,
        x: number,
        y: number,
        frontModule: WeaponType,
        backModule: WeaponType,
        name: string
    ) {
        super(scene, x, y, "player");
        this.setDisplaySize(130, 130);
        const randomDirection = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.weaponBobDirectionX = Math.cos(randomDirection);
        this.weaponBobDirectionY = Math.sin(randomDirection);
        this.previousX = x;
        this.previousY = y;

        this.aimDot = scene.add.circle(x, y, 4, 0xffffff);
        this.playerIdText = scene.add.text(x, y - 48, "", {
            fontFamily: "Arial",
            fontSize: "12px",
            color: "#ffffff"
        }).setOrigin(0.5, 0.5);

        this.frontWeapon = createWeapon(scene, x, y, frontModule);
        this.backWeapon = createWeapon(scene, x, y, backModule);
        this.setPlayerName(name);

        scene.physics.add.existing(this, false);
        scene.add.existing(this);

        const body = this.body as Phaser.Physics.Arcade.Body;
        const radius = 82;
        body.setCircle(radius);
        body.setOffset((this.width - radius * 2) / 2, (this.height - radius * 2) / 2);
        body.setCollideWorldBounds(true);

        
        this.backAccessory = this.backWeapon ? scene.add.image(x, y, "player_bunny") : null;
        this.backAccessory?.setDisplaySize(128, 128);
        this.startBlinkLoop();
        this.updateVisuals();
    }

    public setPlayerId(id: number): void {
        this.playerId = id;
        this.frontWeapon?.setOwnerId(id);
        this.backWeapon?.setOwnerId(id);
        this.playerIdText.setText(this.name + String(id));
    }

    public getPlayerId(): number {
        return this.playerId;
    }

    private setPlayerName(name: string): void {
        this.name = name;
        this.playerIdText.setText(name + String(this.playerId));
    }

    public getPlayerName(): string {
        return this.name;
    }

    protected updateVisuals(): void {
        const movedDistance = Phaser.Math.Distance.Between(this.x, this.y, this.previousX, this.previousY);
        const isMoving = movedDistance > this.movementThresholdPx;
        if (isMoving) {
            this.weaponBobTime += this.scene.game.loop.delta;
        }
        const bobAmount = isMoving
            ? Math.sin(this.weaponBobTime * this.weaponBobFrequency) * this.weaponBobAmplitude
            : 0;
        const bobOffsetX = bobAmount * this.weaponBobDirectionX;
        const bobOffsetY = bobAmount * this.weaponBobDirectionY;

        const aimDistance = this.width / 2;
        this.aimDot.x = this.x + Math.cos(this.currentAimAngle) * aimDistance;
        this.aimDot.y = this.y + Math.sin(this.currentAimAngle) * aimDistance;

        this.setRotation(this.currentAimAngle);

        const aimX = Math.cos(this.currentAimAngle) * 40;
        const aimY = Math.sin(this.currentAimAngle) * 40;
        const backX = Math.cos(this.currentAimAngle) * this.backAccessoryOffset;
        const backY = Math.sin(this.currentAimAngle) * this.backAccessoryOffset;

        this.frontWeapon?.setPosition(this.x + aimX + bobOffsetX, this.y + aimY + bobOffsetY);
        this.frontWeapon?.setRotation(this.currentAimAngle);

        this.backWeapon?.setPosition(this.x - aimX + bobOffsetX, this.y - aimY + bobOffsetY);
        this.backWeapon?.setRotation(this.currentAimAngle + Math.PI);
        if (this.backWeapon) {
            if (!this.backAccessory) {
                this.backAccessory = this.scene.add.image(this.x, this.y, "player_bunny");
                this.backAccessory.setDisplaySize(64, 64);
            }
            this.backAccessory.setPosition(this.x - backX, this.y - backY);
            this.backAccessory.setRotation(this.currentAimAngle);
        } else if (this.backAccessory) {
            this.backAccessory.destroy();
            this.backAccessory = null;
        }
        this.playerIdText.setPosition(this.x, this.y - 48);
        this.previousX = this.x;
        this.previousY = this.y;
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

