import { StructType } from "#entities/structs/Struct.ts";
import { createStruct } from "./factories.ts";

export function loadStructureFromTiledMap(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, layerName: string): void {
    const layer = map.getObjectLayer(layerName);
    if (!layer) {
        console.warn(`Layer ${layerName} not found in the map.`);
        return;
    }

    layer.objects.forEach(obj => {
        if (!obj.type || !obj.x || !obj.y) {
            console.warn(`Object ${obj.name} has missing required properties (type, x, y).`);
        } else {
            scene.add.existing(createStruct(scene, obj.x ?? 0, obj.y ?? 0, obj.type as StructType));
        }
    });
}