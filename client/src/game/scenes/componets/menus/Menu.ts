
export default class Menu extends Phaser.GameObjects.Container {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.setScrollFactor(0, 0);
        this.setDepth(1000);
    }

}