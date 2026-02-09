import { Scene} from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { netClient } from '#net/netClient.ts';
import { PlayerState } from '#net/netClient.ts';
import { createBullet } from '#utils/factories.ts';
import { BaseBullet } from '#entities/bullet/BaseBullet.ts';
import { BasePlayer } from '#player/BasePlayer.ts';
import BaseMelee from '#entities/melee/BaseMelee.ts';

export default class Game extends Scene
{
    private  mapWidth: number;
    private  mapHeight: number;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private player: LocalPlayer;
    private remotePlayers: Map<number, RemotePlayer>;
    private remotePlayersGroup!: Phaser.Physics.Arcade.Group;
    private bulletGroup!: Phaser.Physics.Arcade.Group;
    private meleeGroup!: Phaser.Physics.Arcade.Group;
    private shieldGroup!: Phaser.Physics.Arcade.StaticGroup;

    // NET

    private readonly SEND_INTERVAL_MS = 30;
    private lastPositionSendMs = 0;
    private lastSentX = NaN;
    private lastSentY = NaN;
    private lastSentAngle = NaN;

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

        this.addColisions()

        this.camera = this.cameras.main;;
        this.player = new LocalPlayer(this, 512, 560);
        this.camera.startFollow(this.player, false, 0.08, 0.08);
        this.remotePlayers = new Map();

        netClient.setHandlers({
            onAllPlayers: (players) => {
                this.syncRemotePlayers(players);
            },
            onPlayerAdded: (player) => {
                this.addRemotePlayer(player);
            },
            onPlayerMoved: (player) => {
                this.moveRemotePlayer(player);
            },
            onPlayerRemoved: (playerId) => {
                this.removeRemotePlayer(playerId);
            },
            onPlayerShoot: (data) => {
                this.addRemoteBullet(data.x, data.y, data.angle, data.id);
            },
            onLocalPlayerId: (playerId) => {
                this.player.setPlayerId(playerId);
            },
            onPlayerHit: (data) => {
                this.hitPlayer(data);
            }
        });

        netClient.connect({ x: this.player.x, y: this.player.y });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            netClient.disconnect();
        });
    }

    update (time: number, delta: number)
    {
        this.player.update(delta);

        if (time - this.lastPositionSendMs < this.SEND_INTERVAL_MS) return;

        const x = Math.floor(this.player.x * 1000) / 1000;
        const y = Math.floor(this.player.y * 1000) / 1000;
        const angle = Math.floor(this.player.currentAimAngle * 1000) / 1000;

        if (x === this.lastSentX && y === this.lastSentY && angle === this.lastSentAngle) {
            return;
        }

        this.lastPositionSendMs = time;
        this.lastSentX = x;
        this.lastSentY = y;
        this.lastSentAngle = angle;

        netClient.sendPlayerPosition(x, y, angle);
    }

    private addRemoteBullet(x: number, y: number, angle: number, ownerId: number)
    {
        createBullet(this, x, y, angle, 'BULLET', ownerId)
    }

    private syncRemotePlayers(players: PlayerState[]): void
    {
        const activeIds = new Set<number>();

        players.forEach((player) => {
            activeIds.add(player.id);
            if (this.remotePlayers.has(player.id))
            {
                this.moveRemotePlayer(player);
                return;
            }
            this.addRemotePlayer(player);
        });

        this.remotePlayers.forEach((_value, playerId) => {
            if (!activeIds.has(playerId))
            {
                this.removeRemotePlayer(playerId);
            }
        });
    }

    private addRemotePlayer(player: PlayerState): void
    {
        if (this.remotePlayers.has(player.id))
        {
            return;
        }
        const other = new RemotePlayer(this, player.x, player.y, player.frontModule, player.backModule);
        other.setPlayerId(player.id);
        other.applyRemoteState(player.x, player.y, player.angle ?? 0);

        this.remotePlayers.set(player.id, other);
        this.remotePlayersGroup.add(other);
    }

    private moveRemotePlayer(player: PlayerState): void
    {
        const other = this.remotePlayers.get(player.id);
        if (!other) return;
        other.applyRemoteState(player.x, player.y, player.angle);
    }

    private removeRemotePlayer(playerId: number): void
    {
        const other = this.remotePlayers.get(playerId);
        if (!other)
        {
            return;
        }

        this.remotePlayersGroup.remove(other, false, false);
        other.destroy();
        this.remotePlayers.delete(playerId);
    }

    private hitPlayer(data: { fromId: number; targetId: number }): void {
        if (data.targetId === this.player.getPlayerId()) {
            this.player.setPosition(512, 560);
            return
        }

        const player = this.remotePlayers.get(data.targetId);
        if (!player) return


    }

    private addColisions(): void {
        this.remotePlayersGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.meleeGroup = this.physics.add.group();
        this.shieldGroup = this.physics.add.staticGroup();

        this.events.on("bullet-created", (bullet: BaseBullet) => {
            this.bulletGroup.add(bullet);
            const body = bullet.body as Phaser.Physics.Arcade.Body;
            body.setVelocity(bullet.spawnVelocity.x, bullet.spawnVelocity.y);
        });
        this.events.on("melee-created", (melee: BaseMelee) => {
            this.meleeGroup.add(melee);
        });
        this.events.on("shield-created", (shield: Phaser.GameObjects.GameObject) => {
            this.shieldGroup.add(shield);
        });

        this.physics.add.overlap(
            this.remotePlayersGroup,
            this.bulletGroup,
            this.handleBulletHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );
        this.physics.add.overlap(
            this.remotePlayersGroup,
            this.meleeGroup,
            this.handleMeleeHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );
        this.physics.add.overlap(
            this.bulletGroup,
            this.shieldGroup,
            this.handleShieldBlock as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );
    }

    private handleBulletHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerObj, bulletObj) => {
        const player = (playerObj as unknown) as BasePlayer;
        const bullet = (bulletObj as unknown) as BaseBullet;

        if (!player || !bullet || !player.active || !bullet.active) {
            return;
        }

        if (bullet.ownerId === player.getPlayerId()) return

        bullet.destroy();
        netClient.sendPlayerHit(player.getPlayerId());
    }

    private handleMeleeHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerObj, meleeObj) => {
        const player = playerObj as BasePlayer;
        const melee = meleeObj as BaseMelee;

        if (!player || !melee || !player.active || !melee.active) {
            return;
        }
        const localPlayerId = netClient.getLocalPlayerId()
        if (localPlayerId && localPlayerId === player.getPlayerId()) return

        melee.onHit();
        netClient.sendPlayerHit(player.getPlayerId());
    }

    private handleShieldBlock: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, shieldObj) => {
        const bullet = (bulletObj as unknown) as BaseBullet;
        const shield = (shieldObj as unknown) as Phaser.GameObjects.GameObject & { ownerId?: number | null, rotation?: number };

        if (!bullet || !shield || !bullet.active || !shield.active || !bullet.body) {
            return;
        }

        bullet.destroy();
    }
}
