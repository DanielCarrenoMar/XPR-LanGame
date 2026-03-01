import HitStruct from "./HitStruct.ts";

export default class Portal extends HitStruct {

    private linkedPortal: Portal | null = null;
    private linkedPortalStructureId: number | null = null;

    constructor(scene: Phaser.Scene, x: number, y: number, tintColor: number, texture: string = "shield") {
        super(scene, x, y, texture, 68, 68, 1);

        this.setAlpha(0.85);

        this.setActive(false);
        this.setVisible(false);
        this.setTint(tintColor);
        this.syncBody();

        this.scene.events.emit("portal-created", this);
    }

    public setLinkedPortal(portal: Portal | null): void {
        this.linkedPortal = portal;
        this.linkedPortalStructureId = portal?.structureId ?? null;
    }

    public getLinkedPortalStructureId(): number | null {
        return this.linkedPortalStructureId;
    }

    public placeAt(x: number, y: number): void {
        this.setPosition(x, y);
        this.setActive(true);
        this.setVisible(true);
        this.syncBody();
    }

    public teleport(gameObject: Phaser.GameObjects.GameObject): void {
        if (!this.active || !this.visible || !this.linkedPortal || !this.linkedPortal.active || !this.linkedPortal.visible) {
            return;
        }

        const destination = this.linkedPortal;
        const destinationX = destination.x;
        const destinationY = destination.y;

        const movable = gameObject as Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform;
        if (typeof movable.setPosition !== "function") {
            return;
        }

        movable.setPosition(destinationX, destinationY);

        const body = (gameObject as Phaser.GameObjects.GameObject & { body?: Phaser.Physics.Arcade.Body }).body;
        if (body && body instanceof Phaser.Physics.Arcade.Body) {
            const velocity = body.velocity
            body.reset(destinationX, destinationY);
            body.setVelocity(velocity.x, velocity.y);
        }

        this.setActive(false);
        this.setVisible(false);
        this.linkedPortal?.setActive(false);
        this.linkedPortal?.setVisible(false);
    }

    public syncBody(): void {
        const body = this.body as Phaser.Physics.Arcade.StaticBody | null;
        if (body) {
            body.updateFromGameObject();
        }
    }

    override setDamage(_damage: number): void { }

    override onHit(): number {
        return 1;
    }

    override onSyncServer(): void {
        this.setVisible(this.active);
    }
}