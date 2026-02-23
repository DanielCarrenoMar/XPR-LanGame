import { Scene } from "phaser";
import HitStruct from "./HitStruct.ts";

export default class Wall extends HitStruct {
	private static readonly BASE_LIFE = 20;

	constructor(scene: Scene, x: number, y: number, width: number, height: number) {
		super(scene, x, y, "", width, height, Wall.BASE_LIFE);
	}
}
