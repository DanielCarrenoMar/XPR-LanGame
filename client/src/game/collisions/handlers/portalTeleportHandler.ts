import Portal from '#entities/structs/Portal.ts';

export default function makePortalTeleportHandler() {
    return (target: Phaser.GameObjects.GameObject, portal: Portal): void => {
        if (!portal || !target || !target.active || !portal.active) {
            return;
        }

        portal.teleport(target);
    };
}
