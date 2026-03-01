import { GameObjects, Scene } from "phaser";

export default class IdStruct extends GameObjects.Sprite {
	private static nextStructureId = 0;
	public readonly structureId: number;

	public static resetStructureIds(): void {
		IdStruct.nextStructureId = 0;
	}

	constructor(scene: Scene, x: number, y: number, width: number, height: number, texture: string) {
		super(scene, x, y, texture);

		this.setDisplaySize(width, height);

		this.structureId = IdStruct.nextStructureId;
		IdStruct.nextStructureId += 1;

		scene.add.existing(this);
		scene.physics.add.existing(this, true);
	}
}
