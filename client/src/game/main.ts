import { Boot } from "#scenes/Boot.ts";
import GameScene from "#scenes/Game.ts";
import { Preloader } from "#scenes/Preloader.ts";
import { AUTO, Game } from "phaser";

//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
        }
    },
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        GameScene
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
