import { GameObjects, Scene } from 'phaser';

export default class AlertText extends GameObjects.Container {
    private readonly marginTop = 16;
    private readonly marginRight = 16;
    private readonly horizontalPadding = 14;
    private readonly verticalPadding = 10;

    private readonly background: GameObjects.Rectangle;
    private readonly messageText: GameObjects.Text;
    private hideTimer: Phaser.Time.TimerEvent | null = null;

    constructor(scene: Scene) {
        super(scene, 0, 0);

        this.background = scene.add.rectangle(0, 0, 0, 0, 0x2d2d2d, 0.85);
        this.background.setOrigin(1, 0);

        this.messageText = scene.add.text(0, 0, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#ffffff',
            align: 'right',
            wordWrap: { width: 360, useAdvancedWrap: true }
        });
        this.messageText.setOrigin(1, 0);

        this.add([this.background, this.messageText]);
        this.setDepth(1002);
        this.setScrollFactor(0);
        this.setVisible(false);

        this.updatePosition();
        scene.scale.on(Phaser.Scale.Events.RESIZE, this.updatePosition, this);

        scene.add.existing(this);
    }

    public showError(message: string): void {
        this.show(message, 0xb3261e, null);
    }

    public showInfo(message: string): void {
        this.show(message, 0x1e40af, 5000);
    }

    public clear(): void {
        this.clearHideTimer();
        this.setVisible(false);
        this.messageText.setText('');
    }

    override destroy(fromScene?: boolean): void {
        this.clearHideTimer();
        this.scene.scale.off(Phaser.Scale.Events.RESIZE, this.updatePosition, this);
        super.destroy(fromScene);
    }

    private show(message: string, backgroundColor: number, autoHideDelayMs: number | null): void {
        this.clearHideTimer();

        this.messageText.setText(message);
        this.messageText.setColor('#ffffff');

        const textWidth = this.messageText.width;
        const textHeight = this.messageText.height;
        const backgroundWidth = textWidth + this.horizontalPadding * 2;
        const backgroundHeight = textHeight + this.verticalPadding * 2;

        this.background.setFillStyle(backgroundColor, 0.88);
        this.background.setSize(backgroundWidth, backgroundHeight);

        this.messageText.setPosition(-this.horizontalPadding, this.verticalPadding);

        this.setVisible(true);
        this.updatePosition();

        if (autoHideDelayMs && autoHideDelayMs > 0) {
            this.hideTimer = this.scene.time.delayedCall(autoHideDelayMs, () => {
                this.clear();
            });
        }
    }

    private clearHideTimer(): void {
        if (!this.hideTimer) {
            return;
        }
        this.hideTimer.remove(false);
        this.hideTimer = null;
    }

    private updatePosition(): void {
        const width = this.scene.scale.width;
        this.setPosition(width - this.marginRight, this.marginTop);
    }
}
