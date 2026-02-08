import { Scene} from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { netClient } from '#net/netClient.ts';
import { PlayerState } from '#net/netClient.ts';
import { createBullet } from '#utils/factories.ts';
import { BaseBullet } from '#entities/bullet/BaseBullet.ts';
import { BasePlayer } from '#player/BasePlayer.ts';

export default class Game extends Scene
{
    private  mapWidth: number;
    private  mapHeight: number;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private jugador: LocalPlayer;
    private otherPlayers: Map<number, RemotePlayer>;
    private playerGroup!: Phaser.Physics.Arcade.Group;
    private bulletGroup!: Phaser.Physics.Arcade.Group;

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

        map.createLayer('Floor', tileset);

        this.mapWidth = map.widthInPixels;
        this.mapHeight = map.heightInPixels;

        this.physics.world.setBounds(0, 0, this.mapWidth, this.mapHeight);

        this.playerGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group({ runChildUpdate: true });
        this.events.on("bullet-created", (bullet: BaseBullet) => {
            this.bulletGroup.add(bullet);
            const body = bullet.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(bullet.spawnVelocity.x, bullet.spawnVelocity.y);
        });

        this.camera = this.cameras.main;;
        this.jugador = new LocalPlayer(this, 512, 560);
        this.playerGroup.add(this.jugador);
        this.camera.startFollow(this.jugador, false, 0.08, 0.08);
        this.otherPlayers = new Map();

        this.physics.add.overlap(
            this.playerGroup,
            this.bulletGroup,
            this.handleBulletHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

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
                this.addRemoteBullet(data.x, data.y, data.angle, data.id);
            },
            onLocalPlayerId: (playerId) => {
                this.jugador.playerId = playerId;
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

    private addRemoteBullet(x: number, y: number, angle: number, ownerId: number)
    {
        createBullet(this, x, y, angle, 'BULLET', ownerId)
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
        other.playerId = player.id;
        other.applyRemoteState(player.x, player.y, player.angle ?? 0);

        this.otherPlayers.set(player.id, other);
        this.playerGroup.add(other);
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

        this.playerGroup.remove(other, false, false);
        other.destroy();
        this.otherPlayers.delete(playerId);
    }

    private handleBulletHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerObj, bulletObj) => {
        const player = (playerObj as unknown) as BasePlayer;
        const bullet = (bulletObj as unknown) as BaseBullet;

        if (!player || !bullet || !player.active || !bullet.active) {
            return;
        }

        if (player === this.jugador && bullet.ownerId === null) {
            return;
        }

        if (bullet.ownerId !== null && player.playerId !== null && bullet.ownerId === player.playerId) {
            return;
        }

        bullet.destroy();

        if (bullet.ownerId === netClient.getLocalPlayerId() && player.playerId !== null) {
            netClient.sendPlayerHit(player.playerId);
        }
    }
}
