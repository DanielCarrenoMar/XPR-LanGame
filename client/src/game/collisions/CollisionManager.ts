import { Scene } from 'phaser';
import {
    CollisionGroupId,
    CollisionRule,
    EntityCreationBinding,
} from './types.ts';

type GroupEntry = Phaser.Types.Physics.Arcade.ArcadeColliderType;

let ruleIdSeq = 0;

export class CollisionManager {
    private scene: Scene;
    private groups: Record<CollisionGroupId, GroupEntry | undefined>;
    private colliders = new Map<number, Phaser.Physics.Arcade.Collider>();
    private bindings: EntityCreationBinding[];

    constructor(
        scene: Scene,
        groups: Record<CollisionGroupId, GroupEntry | undefined>,
        bindings: EntityCreationBinding[] = [],
    ) {
        this.scene = scene;
        this.groups = groups;
        this.bindings = bindings;
        this.bindCreationEvents();
    }

    public setGroup(id: CollisionGroupId, group: GroupEntry): void {
        this.groups[id] = group;
    }

    public addRule(rule: CollisionRule): number {
        const sources = this.expand(rule.source);
        const targets = this.expand(rule.target);
        const handler = rule.handler as
            | Phaser.Types.Physics.Arcade.ArcadePhysicsCallback
            | undefined;
        const filter = rule.filter as
            | Phaser.Types.Physics.Arcade.ArcadePhysicsCallback
            | undefined;

        for (const src of sources) {
            for (const tgt of targets) {
                const collider =
                    rule.kind === 'overlap'
                        ? this.scene.physics.add.overlap(
                              src,
                              tgt,
                              handler,
                              filter,
                              this.scene,
                          )
                        : this.scene.physics.add.collider(
                              src,
                              tgt,
                              handler,
                              filter,
                              this.scene,
                          );
                const id = ++ruleIdSeq;
                this.colliders.set(id, collider);
            }
        }
        return ruleIdSeq;
    }

    public removeRule(id: number): void {
        const collider = this.colliders.get(id);
        if (!collider) return;
        collider.destroy();
        this.colliders.delete(id);
    }

    public destroy(): void {
        for (const collider of this.colliders.values()) {
            collider.destroy();
        }
        this.colliders.clear();
        for (const binding of this.bindings) {
            this.scene.events.off(binding.event);
        }
        this.bindings = [];
    }

    private bindCreationEvents(): void {
        for (const binding of this.bindings) {
            this.scene.events.on(binding.event, (obj: any) => {
                const group = this.groups[binding.group];
                if (!group) return;
                if (typeof (group as Phaser.Physics.Arcade.Group).add === 'function') {
                    (group as Phaser.Physics.Arcade.Group).add(obj);
                }
                binding.onCreated?.(obj);
            });
        }
    }

    private expand(
        id: CollisionGroupId | CollisionGroupId[],
    ): GroupEntry[] {
        const ids = Array.isArray(id) ? id : [id];
        const out: GroupEntry[] = [];
        for (const i of ids) {
            const g = this.groups[i];
            if (g) out.push(g);
        }
        return out;
    }
}
