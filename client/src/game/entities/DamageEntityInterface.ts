export default interface OnHitInterface {
    onHit(): void;
    getOwnerId(): number;
    setOwnerId(id: number): void;
    isDamageable(): boolean;
    setDamageable(isDamageable: boolean): void;
}