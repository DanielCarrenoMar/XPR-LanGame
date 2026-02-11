import { Scene } from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { createBullet } from '#utils/factories.ts';
import { BaseBullet } from '#entities/bullet/BaseBullet.ts';
import { BasePlayer } from '#player/BasePlayer.ts';
import BaseMelee from '#entities/melee/BaseMelee.ts';
import { PlayerState } from '#sockets/types.ts';
import { netClient } from '#sockets/netClient.ts';
import NamePrompt from '#scenes/componets/NamePrompt.ts';

export default class Game extends Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private floorLayer: Phaser.Tilemaps.TilemapLayer;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private player: LocalPlayer;
    private remotePlayers: Map<number, RemotePlayer>;
    private remotePlayersGroup!: Phaser.Physics.Arcade.Group;
    private bulletGroup!: Phaser.Physics.Arcade.Group;
    private meleeGroup!: Phaser.Physics.Arcade.Group;
    private shieldGroup!: Phaser.Physics.Arcade.StaticGroup;
    private hasName = false;

    constructor() {
        super('Game');
    }

    create() {
        this.remotePlayersGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.meleeGroup = this.physics.add.group();
        this.shieldGroup = this.physics.add.staticGroup();

        this.setupMap()

        const spawns = this.map.getObjectLayer("PlayerSpawns")?.objects
        if (!spawns || spawns.length === 0) {
            console.error("No player spawns found in the map!");
            return;
        }
        const playerSpawn = spawns[Math.floor(Math.random() * spawns.length)];
        const playerspawnX = playerSpawn.x ?? 512;
        const playerspawnY = playerSpawn.y ?? 560;

        this.camera = this.cameras.main;
        this.camera.startFollow(playerSpawn, false, 0.08, 0.08);

        this.setupNet()

        this.showNamePrompt((name) => {
            this.player = new LocalPlayer(this, playerspawnX, playerspawnY);
            this.camera.startFollow(this.player, false, 0.08, 0.08);
            this.setupCollision()

            netClient.sendNewPlayer({ x: this.player.x, y: this.player.y });

            this.hasName = true;
            this.player.setPlayerName(name);
        });
    }

    private setupMap() {
        this.map = this.make.tilemap({ key: 'mainMap' });
        const tileset = this.map.addTilesetImage('Grass', 'grassTiled');

        if (!tileset) {
            console.error('Tileset not found!');
            return;
        }

        const floorLayer = this.map.createLayer('Floor', tileset);
        if (!floorLayer) {
            console.error('floor layer not found!');
            return;
        }

        this.floorLayer = floorLayer;
        this.floorLayer.setCollisionByProperty({ collides: true });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    private setupCollision(): void {
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

        this.physics.add.collider(this.player, this.floorLayer);

        this.physics.add.collider(this.bulletGroup, this.floorLayer, (bulletObj, _layer) => {
            const bullet = bulletObj as BaseBullet;
            bullet.destroy();
        });
    }

    private setupNet() {
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

        netClient.connect();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            netClient.disconnect();
        });
    }

    update(_time: number, delta: number) {
        if (!this.hasName) {
            return;
        }
        this.player.update(delta);

        netClient.sendPlayerPosition(this.player.x, this.player.y, this.player.currentAimAngle);
    }

    private showNamePrompt(onSubmit: (name: string) => void): void {
        const prompt = new NamePrompt(this, (name) => {
            onSubmit(name);
            prompt.destroy(true);
        });

        this.add.existing(prompt);
    }

    private addRemoteBullet(x: number, y: number, angle: number, ownerId: number) {
        createBullet(this, x, y, angle, 'BULLET', ownerId)
    }

    private syncRemotePlayers(players: PlayerState[]): void {
        const activeIds = new Set<number>();

        players.forEach((player) => {
            activeIds.add(player.id);
            if (this.remotePlayers.has(player.id)) {
                this.moveRemotePlayer(player);
                return;
            }
            this.addRemotePlayer(player);
        });

        this.remotePlayers.forEach((_value, playerId) => {
            if (!activeIds.has(playerId)) {
                this.removeRemotePlayer(playerId);
            }
        });
    }

    private addRemotePlayer(player: PlayerState): void {
        if (this.remotePlayers.has(player.id)) {
            return;
        }
        const other = new RemotePlayer(this, player.x, player.y, player.frontModule, player.backModule);
        other.setPlayerId(player.id);
        other.applyRemoteState(player.x, player.y, player.angle ?? 0);

        this.remotePlayers.set(player.id, other);
        this.remotePlayersGroup.add(other);
    }

    private moveRemotePlayer(player: PlayerState): void {
        const other = this.remotePlayers.get(player.id);
        if (!other) return;
        other.applyRemoteState(player.x, player.y, player.angle);
    }

    private removeRemotePlayer(playerId: number): void {
        const other = this.remotePlayers.get(playerId);
        if (!other) {
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
