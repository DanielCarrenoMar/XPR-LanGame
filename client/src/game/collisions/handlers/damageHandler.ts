import { BasePlayer } from '#player/BasePlayer.ts';
import OnHitInterface from '#entities/DamageEntityInterface.ts';
import { netClient } from '#sockets/netClient.ts';

export default function makeDamageHandler(deps: {
    onLocalPlayerHit?: (player: BasePlayer) => void;
} = {}) {
    return (player: BasePlayer, dmg: Phaser.GameObjects.GameObject & OnHitInterface): void => {
        if (!dmg.isDamageable()) return;
        if (dmg.getOwnerId() === player.getPlayerId()) return;
        if (player.getPlayerId() === netClient.getLocalPlayerId()) return;

        dmg.onHit();
        player.onHit();
        deps.onLocalPlayerHit?.(player);
        netClient.sendPlayerHit(player.getPlayerId());
    };
}
