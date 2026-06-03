import { Scene } from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { PlayerState } from '#sockets/types.ts';
import { netClient } from '#sockets/netClient.ts';
import { repository } from '#utils/repository.ts';
import InputNameMenu from '#componets/menus/InputNameMenu.ts';
import PauseMenu from '#componets/menus/PauseMenu.ts';
import { loadStructureFromTiledMap } from '#utils/mapObjectLoader.ts';
import LifeBar from '#componets/LifeBar.ts';
import AlertText from '#componets/AlertText.ts';
import SpawnMenu from '#componets/menus/SpawnMenu.ts';
import Wall from '#entities/structs/Wall.ts';
import { ScoreKillData, StructHitData, StructLifeMap } from '#sockets/types.ts';
import { createdEvents } from '#utils/eventsDefinitions.ts';
import { CollisionManager } from '#collisions/CollisionManager.ts';
import { CollisionGroupId } from '#collisions/types.ts';
import makeDamageHandler from '#collisions/handlers/damageHandler.ts';
import makeShieldBlockHandler from '#collisions/handlers/shieldBlockHandler.ts';
import makeStructHitHandler from '#collisions/handlers/structHitHandler.ts';
import makePortalTeleportHandler from '#collisions/handlers/portalTeleportHandler.ts';
import makeDespawnHandler from '#collisions/handlers/despawnHandler.ts';
import { composeCollisionHandlers } from '#collisions/compose.ts';

type GroupEntry = Phaser.Types.Physics.Arcade.ArcadeColliderType;

export default class Game extends Scene {
    private map: Phaser.Tilemaps.Tilemap;
    private floorLayer: Phaser.Tilemaps.TilemapLayer;
    private camera: Phaser.Cameras.Scene2D.Camera;
    private player: LocalPlayer;
    private remotePlayers: Map<number, RemotePlayer>;
    private collisionGroups!: Record<CollisionGroupId, GroupEntry>;
    private collisionManager!: CollisionManager;
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
        this.collisionGroups = {
            players: this.physics.add.group(),
            bullets: this.physics.add.group(),
            melee: this.physics.add.group(),
            shields: this.physics.add.staticGroup(),
            structs: this.physics.add.staticGroup(),
            portals: this.physics.add.staticGroup(),
            floor: this.physics.add.staticGroup(),
        };

        this.collisionManager = new CollisionManager(this, this.collisionGroups, [
            { event: createdEvents.BULLET_CREATED, group: 'bullets' },
            { event: createdEvents.MELEE_CREATED, group: 'melee' },
            { event: createdEvents.SHIELD_CREATED, group: 'shields' },
            {
                event: createdEvents.HIT_STRUCT_CREATED,
                group: 'structs',
                onCreated: (wall: Wall) => this.wallsById.set(wall.structureId, wall),
            },
            { event: createdEvents.PORTAL_CREATED, group: 'portals' },
        ]);
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

        this.collisionGroups.floor = this.floorLayer;
        this.collisionManager.setGroup('floor', this.floorLayer);

        loadStructureFromTiledMap(this, this.map, "Structures")
    }

    private setupCollision(): void {
        const damage = makeDamageHandler();
        const shieldBlock = makeShieldBlockHandler();
        const structHit = makeStructHitHandler();
        const portal = makePortalTeleportHandler();
        const despawn = makeDespawnHandler();

        this.collisionManager.addRule({ source: 'players', target: 'bullets', kind: 'overlap', handler: damage });
        this.collisionManager.addRule({ source: 'players', target: 'melee', kind: 'overlap', handler: damage });
        this.collisionManager.addRule({ source: 'bullets', target: 'shields', kind: 'overlap', handler: shieldBlock });
        this.collisionManager.addRule({ source: 'bullets', target: 'structs', kind: 'overlap', handler: composeCollisionHandlers(structHit, despawn) });
        this.collisionManager.addRule({ source: 'melee', target: 'structs', kind: 'overlap', handler: structHit });
        this.collisionManager.addRule({ source: 'players', target: 'portals', kind: 'overlap', handler: portal });
        this.collisionManager.addRule({ source: 'players', target: 'structs', kind: 'collider' });
        this.collisionManager.addRule({ source: 'players', target: 'floor', kind: 'collider' });
        
        this.collisionManager.addRule({ source: 'bullets', target: 'floor', kind: 'collider', handler: despawn });
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
            onPlayerFire: (data) => {
                this.handleRemoteFire(data.id, data.targetX, data.targetY);
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
            onScoreKill: (data) => {
                this.handleScoreKill(data);
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
        this.player = new LocalPlayer(this, playerSpawnX, playerSpawnY, name, this.collisionGroups.players as Phaser.Physics.Arcade.Group);
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
        if (!this.player) {
            return;
        }
        const playerSpawn = this.getRandomSpawnPoint();
        this.player.setPosition(playerSpawn.x, playerSpawn.y);
    }

    private handleScoreKill(data: ScoreKillData): void {
        this.showInfoAlert(`${data.killerName} killed ${data.targetName} [${data.frontModule} | ${data.backModule}] +100 (${data.score})`);
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

    private handleRemoteFire(playerId: number, targetX: number, targetY: number): void {
        if (this.player.getPlayerId() === playerId) {
            return;
        }

        const shooter = this.remotePlayers.get(playerId);
        if (!shooter) {
            return;
        }

        shooter.fire(new Phaser.Math.Vector2(targetX, targetY), false);
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

    private addRemotePlayer(playerState: PlayerState): void {
        if (this.remotePlayers.has(playerState.id)) {
            return;
        }
        const other = new RemotePlayer(this, playerState, this.collisionGroups.players as Phaser.Physics.Arcade.Group);
        other.setPlayerId(playerState.id);
        other.applyRemoteState(playerState.x, playerState.y, playerState.angle ?? 0);

        this.remotePlayers.set(playerState.id, other);
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

        (this.collisionGroups.players as Phaser.Physics.Arcade.Group).remove(other, false, false);
        other.destroy();
        this.remotePlayers.delete(playerId);
    }

    private hitPlayer(data: { fromId: number; targetId: number }): void {
        if (data.targetId === this.player.getPlayerId()) {
            this.onLocalPlayerDamaged();
            const isDead = this.player.getLives() <= 0;
            if (isDead) {
                const killerPlayer = this.remotePlayers.get(data.fromId);
                if (killerPlayer) {
                    this.camera.startFollow(killerPlayer, false, 0.08, 0.08);
                }

                netClient.sendKill(data.fromId);
                this.setMenu(new SpawnMenu(this, this.remotePlayers.get(data.fromId)?.getPlayerName() ?? "Unknown", () => {
                    this.setMenu(null);
                    const spawnPoint = this.getRandomSpawnPoint();
                    this.player.setPosition(spawnPoint.x, spawnPoint.y);
                    this.camera.startFollow(this.player, false, 0.08, 0.08);
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

    private onLocalPlayerDamaged(): void {
        this.player.onHit();
        this.applyDamageCameraShake();
        this.lifeBar?.setLives(this.player.getLives(), this.player.getMaxLives());
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
}
