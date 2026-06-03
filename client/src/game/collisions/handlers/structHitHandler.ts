import OnHitInterface from '#entities/DamageEntityInterface.ts';
import Wall from '#entities/structs/Wall.ts';
import { netClient } from '#sockets/netClient.ts';

export default function makeStructHitHandler() {
    return (bullet: Phaser.GameObjects.GameObject & OnHitInterface, wall: Wall): void => {

        if (!bullet || !wall || !bullet.active || !wall.active) {
            return;
        }

        if (!bullet.isDamageable()) {
            return;
        }

        wall.onHit();
        netClient.sendHitStruct(wall.structureId);
    };
}
