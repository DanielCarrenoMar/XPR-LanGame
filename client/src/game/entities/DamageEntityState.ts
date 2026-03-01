export default class DamageEntityState {
    private ownerId: number;
    private damageable: boolean;

    constructor(ownerId: number, isDamageable: boolean) {
        this.ownerId = ownerId;
        this.damageable = isDamageable;
    }

    public getOwnerId(): number {
        return this.ownerId;
    }
    public setOwnerId(ownerId: number): void {
        this.ownerId = ownerId;
    }

    public isDamageable(): boolean {
        return this.damageable;
    }
    public setDamageable(isDamageable: boolean): void {
        this.damageable = isDamageable;
    }
}