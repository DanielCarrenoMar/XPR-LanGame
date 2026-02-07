import { Boot } from "#scenes/Boot.ts";
import { InitialMenu } from "#scenes/InitialMenu.ts";
import { Preloader } from "#scenes/Preloader.ts";
import { AUTO, Game } from "phaser";

//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        Boot,
        Preloader,
        InitialMenu,
        Game
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
