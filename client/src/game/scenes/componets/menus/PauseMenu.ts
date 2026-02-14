import { repository } from "#utils/repository.ts";
import Button from "../Button.ts";
import Menu from "./Menu.ts";

export default class PauseMenu extends Menu {
    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        const { width, height } = scene.scale;

        const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0, 0);
        const tutorialText = scene.add.text(width / 2, height / 2 - 70, 'Mover con W A S D\n Disparar con click Izquierdo \n Menu de opcciones con Escape', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5, 0.5);

        
        const hint = scene.add.text(width / 2, height / 2 + 50, 'Presiona Escape para cerrar', {
            fontFamily: 'Arial',
            fontSize: '16px',
            color: '#dddddd'
        }).setOrigin(0.5, 0.5);

        const resetButton = new Button(scene, width / 2, height / 2 + 120, {
            label: 'Reiniciar Partida',
            onClick: () => {
                repository.resetAllVariables()
            }
        });

        this.add([overlay, tutorialText, hint, resetButton]);
        this.setSize(width, height);

        scene.add.existing(this);
    }
}