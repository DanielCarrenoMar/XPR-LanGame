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
    private jugador: LocalPlayer;
    private otherPlayers: Map<number, RemotePlayer>;
    private remotePlayersGroup!: Phaser.Physics.Arcade.Group;
    private bulletGroup!: Phaser.Physics.Arcade.Group;
    private meleeGroup!: Phaser.Physics.Arcade.Group;
    private shieldGroup!: Phaser.Physics.Arcade.StaticGroup;

    // NET

    private lastPositionSendMs = 0;
    private readonly positionSendIntervalMs = 80;
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
                this.addRemoteBullet(data.x, data.y, data.angle, data.id);
            },
            onLocalPlayerId: (playerId) => {
                this.jugador.setPlayerId(playerId);
            }
        });

        netClient.connect();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            netClient.disconnect();
        });
    }

    update (time: number, delta: number)
    {
        this.jugador.update(delta);

        if (time - this.lastPositionSendMs < this.positionSendIntervalMs) return;

        const x = Math.floor(this.jugador.x * 100) / 100;
        const y = Math.floor(this.jugador.y * 100) / 100;
        const angle = Math.floor(this.jugador.currentAimAngle * 100) / 100;

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
        other.setPlayerId(player.id);
        other.applyRemoteState(player.x, player.y, player.angle ?? 0);

        this.otherPlayers.set(player.id, other);
        this.remotePlayersGroup.add(other);
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

        this.remotePlayersGroup.remove(other, false, false);
        other.destroy();
        this.otherPlayers.delete(playerId);
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


        bullet.destroy();

        if (bullet.ownerId === netClient.getLocalPlayerId() && player.getPlayerId() !== null) {
            netClient.sendPlayerHit(player.getPlayerId());
        }
    }

    private handleMeleeHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerObj, meleeObj) => {
        const player = playerObj as BasePlayer;
        const melee = meleeObj as BaseMelee;

        if (!player || !melee || !player.active || !melee.active) {
            return;
        }

        melee.onHit();
        netClient.sendPlayerHit(player.getPlayerId());
    }

    private handleShieldBlock: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, shieldObj) => {
        const bullet = (bulletObj as unknown) as BaseBullet;
        const shield = (shieldObj as unknown) as Phaser.GameObjects.GameObject & { ownerId?: number | null, rotation?: number };

        if (!bullet || !shield || !bullet.active || !shield.active || !bullet.body) {
            return;
        }

        const body = bullet.body as Phaser.Physics.Arcade.Body;
        const velocity = body.velocity.clone();
        const normal = new Phaser.Math.Vector2(Math.cos(shield.rotation ?? 0), Math.sin(shield.rotation ?? 0)).normalize();
        const reflected = velocity.reflect(normal).scale(0.9);

        body.setVelocity(reflected.x, reflected.y);

        const offset = reflected.clone().normalize().scale(6);
        bullet.setPosition(bullet.x + offset.x, bullet.y + offset.y);

        bullet.ownerId = shield.ownerId ?? bullet.ownerId;
    }
}
