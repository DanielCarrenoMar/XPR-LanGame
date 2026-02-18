import Menu from './Menu.ts';

export default class SpawnMenu extends Menu {
    private readonly onAnyKeyDown: () => void;

    constructor(scene: Phaser.Scene, killerName: string, onPressAnyKey: () => void) {
        super(scene, 0, 0);

        const { width, height } = scene.scale;

        const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0, 0);

        const spawnText = scene.add.text(width / 2, height / 2,  `Te ha matado ${killerName}\nPulsa cualquier tecla para reaparecer`, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);

        this.add([overlay, spawnText]);
        this.setSize(width, height);

        this.onAnyKeyDown = () => {
            onPressAnyKey();
        };

        scene.input.keyboard?.once('keydown', this.onAnyKeyDown);

        scene.add.existing(this);
    }

    override destroy(fromScene?: boolean): void {
        this.scene.input.keyboard?.off('keydown', this.onAnyKeyDown);
        super.destroy(fromScene);
    }
}
