import { GameObjects, Scene } from "phaser";

export default class HitStruct extends GameObjects.Sprite {
	private static nextStructureId = 0;
	private readonly maxLife;
    private life;
	public readonly structureId: number;

	public static resetStructureIds(): void {
		HitStruct.nextStructureId = 0;
	}

	constructor(scene: Scene, x: number, y: number, texture: string, width: number, height: number, maxLife: number) {
		super(scene, x, y, texture);
        this.maxLife = maxLife;
        this.life = maxLife;
        this.setDisplaySize(width, height);
        this.setVisible(false); // Se volvera visible al sincronizar con el server

		this.structureId = HitStruct.nextStructureId;
		HitStruct.nextStructureId += 1;

		scene.add.existing(this);
		scene.physics.add.existing(this, true);
		this.scene.events.emit("struct-created", this);
	}

	private setLife(life: number): void {
		this.life = Math.max(0, life);
		if (this.life === 0) this.onDeath();
	}

    public getLife(): number {
		return this.maxLife;
	}

	public setDamage(damage: number): void {
		const safeDamage = Number.isFinite(damage) ? Math.max(0, Math.floor(damage)) : 0;
		this.setLife(this.maxLife - safeDamage);
	}

    public onHit(): number {
		this.life = Math.max(0, this.life - 1);
        if (this.life === 0) this.onDeath();
		return this.life;
	}

    public onDeath(): void {
        this.destroy();
    }

    public onSyncServer(){
        if (this.maxLife === 0) this.onDeath();
        this.setVisible(true);
    }
}
