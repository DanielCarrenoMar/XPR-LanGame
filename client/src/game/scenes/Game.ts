import { Scene, Math as PhaserMath, GameObjects } from 'phaser';
import { Jugador } from '../Jugador';
import { netClient, PlayerState } from '../../net/netClient';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text : Phaser.GameObjects.Text;
    jugador: Jugador;
    otherPlayers: Map<number, Phaser.GameObjects.Arc>;
    remoteBullets: { sprite: Phaser.GameObjects.Arc; velocity: PhaserMath.Vector2 }[];

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

        this.jugador = new Jugador(this, 512, 560, (x, y, angle) => {
            netClient.sendFire(x, y, angle);
        });
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

        window.addEventListener('beforeunload', () => {
            netClient.disconnect();
        })
    }

    update (_time: number, delta: number)
    {
        this.jugador.update(delta);
        netClient.sendPlayerPosition(this.jugador.x, this.jugador.y);
        
        this.updateRemoteBullets(delta);
        this.checkCollisions();
    }

    private addRemoteBullet(x: number, y: number, angle: number)
    {
        const bulletSpeed = 520; // Same as Jugador
        const bullet = this.add.circle(x, y, 6, 0xff0000); // Red color for enemy bullets
        const velocity = new PhaserMath.Vector2(Math.cos(angle), Math.sin(angle)).scale(bulletSpeed);
        this.remoteBullets.push({ sprite: bullet, velocity });
    }

    private updateRemoteBullets(delta: number)
    {
        const step = delta / 1000;
        const width = this.scale.width;
        const height = this.scale.height;

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
            const dist = PhaserMath.Distance.Between(bullet.sprite.x, bullet.sprite.y, this.jugador.x, this.jugador.y);

            if (dist < 30) // Player radius ~20 + Bullet radius ~6 + buffer
            {
                bullet.sprite.destroy();
                this.remoteBullets.splice(i, 1);
                this.jugador.setPosition(200,200)
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
