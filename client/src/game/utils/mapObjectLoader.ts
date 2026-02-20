import { StructType } from "#entities/structs/Struct.ts";
import { createStruct } from "./factories.ts";
import Wall from "#entities/structs/Wall.ts";

export function loadStructureFromTiledMap(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap, layerName: string): void {
    Wall.resetStructureIds();

    const layer = map.getObjectLayer(layerName);
    if (!layer) {
        console.warn(`Layer ${layerName} not found in the map.`);
        return;
    }

    layer.objects.forEach(obj => {
        if (!obj.type || !obj.x || !obj.y || !obj.width || !obj.height) {
            console.warn(`Object ${obj.name} has missing required properties (type, x, y, width, height).`);
        } else {
            createStruct(scene, obj.x, obj.y, obj.width, obj.height, obj.type as StructType);
        }
    });
}