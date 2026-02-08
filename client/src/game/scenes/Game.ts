import { Scene, Math as PhaserMath } from 'phaser';
import { RemotePlayer } from '#player/RemotePlayer.ts';
import { LocalPlayer } from '#player/LocalPlayer.ts';
import { netClient } from '#net/netClient.ts';
import { PlayerState } from '#net/netClient.ts';

export default class Game extends Scene
{
    private  mapWidth: number;
    private  mapHeight: number;
    camera: Phaser.Cameras.Scene2D.Camera;
    msg_text : Phaser.GameObjects.Text;
    jugador: LocalPlayer;
    otherPlayers: Map<number, RemotePlayer>;
    remoteBullets: { sprite: Phaser.GameObjects.Arc; velocity: PhaserMath.Vector2 }[];

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

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        this.jugador = new LocalPlayer(this, 512, 560, (x, y, angle) => {
            netClient.sendFire(x, y, angle);
        });
        this.camera.startFollow(this.jugador, false, 0.08, 0.08);
        this.otherPlayers = new Map();
        this.remoteBullets = [];

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
        
        this.updateRemoteBullets(delta);
        this.checkCollisions();
        this.checkLocalBulletsVsShields();
    }

    private addRemoteBullet(x: number, y: number, angle: number)
    {
        const bulletSpeed = 520; // Same as LocalPlayer
        const bullet = this.add.circle(x, y, 6, 0xff0000); // Red color for enemy bullets
        const velocity = new PhaserMath.Vector2(Math.cos(angle), Math.sin(angle)).scale(bulletSpeed);
        this.remoteBullets.push({ sprite: bullet, velocity });
    }

    private updateRemoteBullets(delta: number)
    {
        const step = delta / 1000;
        const width = this.mapWidth;
        const height = this.mapHeight;

        for (let i = this.remoteBullets.length - 1; i >= 0; i--)
        {
            const b = this.remoteBullets[i];
            b.sprite.x += b.velocity.x * step;
            b.sprite.y += b.velocity.y * step;

            if (b.sprite.x < -20 || b.sprite.x > width + 20 ||
                b.sprite.y < -20 || b.sprite.y > height + 20)
            {
                b.sprite.destroy();
                this.remoteBullets.splice(i, 1);
            }
        }
    }

    private checkCollisions()
    {
        // Check other players' bullets vs me
        for (let i = this.remoteBullets.length - 1; i >= 0; i--)
        {
            const bullet = this.remoteBullets[i];

            if (this.jugador.checkShieldCollision(bullet.sprite.x, bullet.sprite.y)) {
                bullet.sprite.destroy();
                this.remoteBullets.splice(i, 1);
                continue;
            }

            const dist = PhaserMath.Distance.Between(bullet.sprite.x, bullet.sprite.y, this.jugador.x, this.jugador.y);

            if (dist < 30) // Player radius ~20 + Bullet radius ~6 + buffer
            {
                bullet.sprite.destroy();
                this.remoteBullets.splice(i, 1);
                this.jugador.setPosition(200,200)
            }
        }
    }

    private checkLocalBulletsVsShields(): void
    {
        if (!this.jugador.bullets.length || !this.otherPlayers.size) {
            return;
        }

        for (let i = this.jugador.bullets.length - 1; i >= 0; i--)
        {
            const bullet = this.jugador.bullets[i];
            let blocked = false;

            for (const other of this.otherPlayers.values())
            {
                if (other.checkShieldCollision(bullet.sprite.x, bullet.sprite.y))
                {
                    blocked = true;
                    break;
                }
            }

            if (blocked)
            {
                bullet.sprite.destroy();
                this.jugador.bullets.splice(i, 1);
            }
        }
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

        const other = new RemotePlayer(this, player.x, player.y, 0xf4a261, player.frontModule, player.backModule);
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
