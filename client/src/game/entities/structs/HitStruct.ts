import { Scene } from "phaser";
import IdStruct from "./IdStruct.ts";
import { createdEvents } from "#utils/eventsDefinitions.ts";

export default class HitStruct extends IdStruct {
	private readonly maxLife;
    private life;

	constructor(scene: Scene, x: number, y: number, texture: string, width: number, height: number, maxLife: number) {
		super(scene, x, y, texture);
        this.maxLife = maxLife;
        this.life = maxLife;
        this.setDisplaySize(width, height);
        this.setVisible(false); // Se volvera visible al sincronizar con el server

		this.scene.events.emit(createdEvents.HIT_STRUCT_CREATED, this);
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
