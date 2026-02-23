import { Scene } from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { createBullet } from '#utils/factories.ts';
import { BaseBullet } from '#entities/bullet/BaseBullet.ts';
import { BasePlayer } from '#player/BasePlayer.ts';
import BaseMelee from '#entities/melee/BaseMelee.ts';
import { PlayerState } from '#sockets/types.ts';
import { netClient } from '#sockets/netClient.ts';
import BaseShield from '#entities/shield/BaseShield.ts';
import { repository } from '#utils/repository.ts';
import InputNameMenu from '#componets/menus/InputNameMenu.ts';
import PauseMenu from '#componets/menus/PauseMenu.ts';
import { loadStructureFromTiledMap } from '#utils/mapObjectLoader.ts';
import LifeBar from '#componets/LifeBar.ts';
import AlertText from '#componets/AlertText.ts';
import SpawnMenu from '#componets/menus/SpawnMenu.ts';
import Wall from '#entities/structs/Wall.ts';
import { StructHitData, StructLifeMap } from '#sockets/types.ts';

export default class Game extends Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private floorLayer: Phaser.Tilemaps.TilemapLayer;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private player: LocalPlayer;
    private remotePlayers: Map<number, RemotePlayer>;
    private playersGroup!: Phaser.Physics.Arcade.Group;
    private bulletGroup!: Phaser.Physics.Arcade.Group;
    private meleeGroup!: Phaser.Physics.Arcade.Group;
    private shieldGroup!: Phaser.Physics.Arcade.StaticGroup;
    private structGroup!: Phaser.Physics.Arcade.StaticGroup;
    private playerHasName = false;
    private activeMenu: Phaser.GameObjects.Container | null = null;
    private lifeBar: LifeBar | null = null;
    private alertText: AlertText | null = null;
    private wallsById: Map<number, Wall> = new Map();
    private isBattleMode = false;

    constructor() {
        super('Game');
    }

    create() {
        this.setupCollisionGroups()

        this.setupMap()
        this.alertText = new AlertText(this);

        this.isBattleMode = repository.getStoredBattleMode();

        const playerSpawn = this.getRandomSpawnPoint();
        const playerSpawnX = playerSpawn.x;
        const playerSpawnY = playerSpawn.y;

        this.camera = this.cameras.main;
        this.camera.startFollow(playerSpawn, false, 0.08, 0.08);

        this.setupNet()

        const storedName = repository.getStoredName();
        if (!storedName) {
            this.setMenu(
                new InputNameMenu(this, (name) => {
                    this.setupPlayer(playerSpawnX, playerSpawnY, name)
                    this.setupCollision()

                    this.setMenu(null);
                    this.playerHasName = true;
                })
            )
        } else {
            this.setupPlayer(playerSpawnX, playerSpawnY, storedName)
            this.setupCollision()
            this.playerHasName = true;
        }

        this.input.keyboard?.on('keydown-ESC', () => {
            if (this.activeMenu) {
                if (this.activeMenu instanceof PauseMenu) {
                    this.setMenu(null);
                }
                return;
            }

            this.setMenu(new PauseMenu(this, (err) => { this.showErrorAlert("Error al reiniciar variables: " + err.message) }));
        });
    }

    private setupCollisionGroups(): void {
        this.playersGroup = this.physics.add.group();
        this.bulletGroup = this.physics.add.group();
        this.meleeGroup = this.physics.add.group();
        this.shieldGroup = this.physics.add.staticGroup();
        this.structGroup = this.physics.add.staticGroup();

        this.events.on("bullet-created", (bullet: BaseBullet) => {
            this.bulletGroup.add(bullet);
        });
        this.events.on("melee-created", (melee: BaseMelee) => {
            this.meleeGroup.add(melee);
        });
        this.events.on("shield-created", (shield: BaseShield) => {
            this.shieldGroup.add(shield);
        });
        this.events.on("struct-created", (struct: Wall) => {
            this.wallsById.set(struct.structureId, struct);
            this.structGroup.add(struct);
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

        loadStructureFromTiledMap(this, this.map, "Structures")
    }

    private setupCollision(): void {
        this.physics.add.overlap(
            this.playersGroup,
            this.bulletGroup,
            this.handleBulletHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );
        this.physics.add.overlap(
            this.playersGroup,
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
        this.physics.add.collider(this.playersGroup, this.structGroup);

        this.physics.add.overlap(
            this.bulletGroup,
            this.structGroup,
            this.handleStructHit as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
            undefined,
            this
        );

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
            },
            onStructHit: (data) => {
                this.hitStruct(data);
            },
            onAllLifeStructs: (structLifes) => {
                this.syncStructLifes(structLifes);
            },
            onError: (message) => {
                this.showErrorAlert(message);
            },
            onBattleMode: (active) => {
                this.setBattleMode(active);
                this.showInfoAlert(`Battle mode ${active ? "activated" : "deactivated"}!`);
            }
        });

        netClient.connect();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            netClient.disconnect();
        });
    }

    private setupPlayer(playerSpawnX: number, playerSpawnY: number, name: string = 'Player') {
        this.player = new LocalPlayer(this, playerSpawnX, playerSpawnY, name);
        this.playersGroup.add(this.player);
        this.camera.startFollow(this.player, false, 0.08, 0.08);

        if (!this.lifeBar) {
            this.lifeBar = new LifeBar(this, this.player.getMaxLives());
        } else {
            this.lifeBar.setLives(this.player.getLives(), this.player.getMaxLives());
        }
        this.player.resetLives();
        this.lifeBar.setLives(this.player.getLives(), this.player.getMaxLives());

        netClient.sendNewPlayer({ x: this.player.x, y: this.player.y, name });
    }

    private setMenu(menu: Phaser.GameObjects.Container | null): void {
        if (this.activeMenu) {
            this.activeMenu.destroy(true);
        }
        this.activeMenu = menu;
    }

    private setBattleMode(active: boolean): void {
        this.isBattleMode = active;
        repository.saveBattleMode(active);
        const playerSpawn = this.getRandomSpawnPoint();
        this.player.setPosition(playerSpawn.x, playerSpawn.y);
    }

    public showErrorAlert(message: string): void {
        this.alertText?.showError(message);
    }

    public showInfoAlert(message: string): void {
        this.alertText?.showInfo(message);
    }

    private getRandomSpawnPoint(): { x: number; y: number} {
        let layerName = this.isBattleMode ? "PlayerSpawnsBattle" : "PlayerSpawns";
        const defaultSpawn = { x: 512, y: 512 };

        const spawns = this.map.getObjectLayer(layerName)?.objects
        if (!spawns || spawns.length === 0) {
            console.error("No player spawns found in the map!");
            return defaultSpawn;
        }
        const playerSpawn = spawns[Math.floor(Math.random() * spawns.length)];
        if (!playerSpawn || playerSpawn.x === undefined || playerSpawn.y === undefined) {
            console.error("Invalid player spawn point found!");
            return defaultSpawn;
        }
        return { x: playerSpawn.x, y: playerSpawn.y };
    }

    update(_time: number, delta: number) {
        if (!this.playerHasName) return;
        this.player.update(delta);
        netClient.sendPlayerPosition(this.player.x, this.player.y, this.player.currentAimAngle);
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
        const other = new RemotePlayer(this, player);
        other.setPlayerId(player.id);
        other.applyRemoteState(player.x, player.y, player.angle ?? 0);

        this.remotePlayers.set(player.id, other);
        this.playersGroup.add(other);
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

        this.playersGroup.remove(other, false, false);
        other.destroy();
        this.remotePlayers.delete(playerId);
    }

    private hitPlayer(data: { fromId: number; targetId: number }): void {
        console.log(`Player ${data.targetId} hit by player ${data.fromId}`);
        if (data.targetId === this.player.getPlayerId()) {
            this.player.onHit();
            const isDead = this.player.getLives() <= 0;
            this.applyDamageCameraShake();
            this.lifeBar?.setLives(this.player.getLives(), this.player.getMaxLives());
            if (isDead) {
                this.setMenu(new SpawnMenu(this, this.remotePlayers.get(data.fromId)?.getPlayerName() ?? "Unknown", () => {
                    this.setMenu(null);
                    this.player.setPosition(512, 560);
                }));
                this.player.setPosition(0, 0);
                this.player.resetLives();
                this.lifeBar?.setLives(this.player.getLives(), this.player.getMaxLives());
            }
            return;
        }

        const player = this.remotePlayers.get(data.targetId);
        if (!player) return


    }

    private applyDamageCameraShake(): void {
        if (!this.camera) return;
        if (this.camera.shakeEffect?.isRunning) return;
        this.camera.shake(120, 0.002);
    }

    private hitStruct(data: StructHitData): void {
        const wall = this.wallsById.get(data.structureId);
        if (!wall) {
            return;
        }

        wall.setDamage(data.damage);
    }

    private syncStructLifes(structLifes: StructLifeMap): void {
        Object.entries(structLifes).forEach(([structureId, damage]) => {
            const parsedId = Number(structureId);
            const wall = this.wallsById.get(parsedId);
            if (!wall) {
                return;
            }
            wall.setDamage(damage);
        });

        this.wallsById.forEach((wall) => {
            wall.onSyncServer();
        })
    }

    private handleBulletHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (playerObj, bulletObj) => {
        const player = (playerObj as unknown) as BasePlayer;
        const bullet = (bulletObj as unknown) as BaseBullet;

        if (!player || !bullet || !player.active || !bullet.active) {
            return;
        }

        if (bullet.ownerId === player.getPlayerId()) return
        if (player.getPlayerId() === netClient.getLocalPlayerId()) return

        bullet.destroy();
        player.onHit();
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

        if (bullet.ownerId === shield.ownerId) {
            return;
        }

        bullet.destroy();
    }

    private handleStructHit: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (bulletObj, structObj) => {
        const bullet = bulletObj as BaseBullet;
        const wall = structObj as Wall;

        if (!bullet || !wall || !bullet.active || !wall.active) {
            return;
        }

        wall.onHit();
        netClient.sendHitStruct(wall.structureId);
        bullet.destroy();
    }
}
