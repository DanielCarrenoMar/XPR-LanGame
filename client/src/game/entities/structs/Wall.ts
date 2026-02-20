import { GameObjects, Scene } from "phaser";

export default class Wall extends GameObjects.Sprite {
	private static nextStructureId = 0;
	private life = 20;
	public readonly structureId: number;

	public static resetStructureIds(): void {
		Wall.nextStructureId = 0;
	}

	constructor(scene: Scene, x: number, y: number, width: number, height: number) {
		super(scene, x, y, "");
        this.setDisplaySize(width, height);
        this.setVisible(false); // Se volvera visible al sincronizar con el server

		this.structureId = Wall.nextStructureId;
		Wall.nextStructureId += 1;

		scene.add.existing(this);
		scene.physics.add.existing(this, true);
		this.scene.events.emit("struct-created", this);
	}

	public onHit(): number {
		this.life = Math.max(0, this.life - 1);
        if (this.life === 0) this.destroy();
		return this.life;
	}

	public setLife(life: number): void {
		this.life = Math.max(0, life);
        
	}

	public getLife(): number {
		return this.life;
	}

    public onSyncServer(){
        if (this.life === 0) this.destroy();
        this.setVisible(true);
    }
}
