import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');
        this.load.image('yoshi', 'yoshi.jpg');
        this.load.image('bush', 'bush.png');

        this.load.setPath('assets/player');
        this.load.image('player', 'player.png');
        this.load.image("player_blink", 'player_blink.png');
        this.load.image('player_bunny', 'player_bunny.png');

        this.load.setPath('assets/player/decorations');
        this.load.image('deco_moustache', 'deco_moustache.png');
        this.load.image('deco_bandage', 'deco_bandage.png');

        this.load.setPath('assets/player/life');
        this.load.image('vida', 'vida.png');
        this.load.image('vidant', "vidan't.png");

        this.load.setPath('assets/weapons');
        this.load.image('shield', 'shield.jpg');
        this.load.image('shotgun', 'shotgun.png');
        this.load.image('sword', 'sword.webp');

        this.load.setPath('tiled/tiledsets');
        this.load.image('grassTiled', 'Grass.png');

        this.load.setPath('tiled/maps');
        this.load.tilemapTiledJSON('mainMap', 'mainMap.json');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('Game');
    }
}
