
export default class Menu extends Phaser.GameObjects.Container {
    private readonly cameraOffsetX: number;
    private readonly cameraOffsetY: number;
    private readonly followCameraHandler: () => void;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.cameraOffsetX = x;
        this.cameraOffsetY = y;
        this.setDepth(1000);
        this.setScrollFactor(1, 1, true);

        this.followCameraHandler = () => {
            const camera = scene.cameras.main;
            this.setPosition(camera.scrollX + this.cameraOffsetX, camera.scrollY + this.cameraOffsetY);
        };

        this.followCameraHandler();
        scene.events.on(Phaser.Scenes.Events.UPDATE, this.followCameraHandler);

    }

    override destroy(fromScene?: boolean): void {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.followCameraHandler);
        super.destroy(fromScene);

    }

}