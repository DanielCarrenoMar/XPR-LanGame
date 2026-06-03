export default function makeDespawnHandler() {
    return (obj: Phaser.GameObjects.GameObject, _layer: unknown): void => {
        if (!obj) return;
        obj.destroy();
    };
}
