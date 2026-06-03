export type CollisionGroupId =
    | 'players'
    | 'bullets'
    | 'melee'
    | 'shields'
    | 'structs'
    | 'portals'
    | 'floor';

export type CollisionKind = 'overlap' | 'collider';

export type CollisionHandler = (a: any, b: any) => void;
export type CollisionFilter = (a: any, b: any) => boolean;

export interface CollisionRule {
    source: CollisionGroupId | CollisionGroupId[];
    target: CollisionGroupId | CollisionGroupId[];
    kind: CollisionKind;
    handler?: CollisionHandler;
    filter?: CollisionFilter;
}

export interface EntityCreationBinding {
    event: string;
    group: CollisionGroupId;
    onCreated?: (obj: any) => void;
}
