import { Scene} from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { netClient } from '#net/netClient.ts';
import { PlayerState } from '#net/netClient.ts';
import { createBullet } from '#utils/factories.ts';
import Bullet from '#entities/bullet/Bullet.ts';
import { BaseBullet } from '#entities/bullet/BaseBullet.ts';

export default class Game extends Scene
{
    private  mapWidth: number;
    private  mapHeight: number;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private jugador: LocalPlayer;
    private otherPlayers: Map<number, RemotePlayer>;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        const map = this.make.tilemap({ key: 'mainMap' });
        const tileset = map.addTilesetImage('Grass', 'grassTiled');

        if (!tileset) {
            console.error('Tileset not found!');
            return;
        }

        const floorLayer = map.createLayer('Floor', tileset);

        this.mapWidth = map.widthInPixels;
        this.mapHeight = map.heightInPixels;

        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        this.camera = this.cameras.main;;
        this.jugador = new LocalPlayer(this, 512, 560);
        this.camera.startFollow(this.jugador, false, 0.08, 0.08);
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
            },
            onPlayerShoot: (data) => {
                this.addRemoteBullet(data.x, data.y, data.angle);
            }
        });

        netClient.connect();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            netClient.disconnect();
        });
    }

    update (_time: number, delta: number)
    {
        this.jugador.update(delta);
        netClient.sendPlayerPosition(this.jugador.x, this.jugador.y, this.jugador.currentAimAngle);

    }

    private addRemoteBullet(x: number, y: number, angle: number)
    {
        createBullet(this, x, y, angle, 'BULLET')
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
        const other = new RemotePlayer(this, player.x, player.y, player.frontModule, player.backModule);
        other.applyRemoteState(player.x, player.y, player.angle ?? 0);

        this.otherPlayers.set(player.id, other);
    }

    private moveOtherPlayer(player: PlayerState): void
    {
        const other = this.otherPlayers.get(player.id);
        if (!other)
        {
            return;
        }

        other.applyRemoteState(player.x, player.y, player.angle ?? other.currentAimAngle);
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
