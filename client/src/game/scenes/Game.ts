import { Scene } from 'phaser';
import { Jugador } from '../Jugador';
import { netClient, PlayerState } from '../../net/netClient';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    jugador: Jugador;
    otherPlayers: Map<number, Phaser.GameObjects.Arc>;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(512, 384, 'Make something fun!\nand share it with us:\nsupport@phaser.io', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0.5);

        this.jugador = new Jugador(this, 512, 560);
        this.otherPlayers = new Map();

        netClient.setHandlers({
            onAllPlayers: (players) => {
                this.syncOtherPlayers(players);
            },
            onPlayerAdded: (player) => {
                this.addOtherPlayer(player);
            },
            onPlayerMoved: (player) => {
                this.moveOtherPlayer(player);
            },
            onPlayerRemoved: (playerId) => {
                this.removeOtherPlayer(playerId);
            }
        });

        netClient.connect();
    }

    update (_time: number, delta: number)
    {
        this.jugador.update(delta);
        netClient.sendPlayerPosition(this.jugador.x, this.jugador.y);
    }

    private syncOtherPlayers(players: PlayerState[]): void
    {
        const activeIds = new Set<number>();

        players.forEach((player) => {
            activeIds.add(player.id);
            if (this.otherPlayers.has(player.id))
            {
                this.moveOtherPlayer(player);
                return;
            }
            this.addOtherPlayer(player);
        });

        this.otherPlayers.forEach((_value, playerId) => {
            if (!activeIds.has(playerId))
            {
                this.removeOtherPlayer(playerId);
            }
        });
    }

    private addOtherPlayer(player: PlayerState): void
    {
        if (this.otherPlayers.has(player.id))
        {
            return;
        }

        const other = this.add.circle(player.x, player.y, 18, 0xf4a261);
        other.setStrokeStyle(2, 0x243b2d);
        this.otherPlayers.set(player.id, other);
    }

    private moveOtherPlayer(player: PlayerState): void
    {
        const other = this.otherPlayers.get(player.id);
        if (!other)
        {
            return;
        }

        other.x = player.x;
        other.y = player.y;
    }

    private removeOtherPlayer(playerId: number): void
    {
        const other = this.otherPlayers.get(playerId);
        if (!other)
        {
            return;
        }

        other.destroy();
        this.otherPlayers.delete(playerId);
    }
}
