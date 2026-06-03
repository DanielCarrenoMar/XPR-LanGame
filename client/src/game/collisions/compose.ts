import { CollisionHandler } from './types.ts';

export const composeCollisionHandlers = (...handlers: CollisionHandler[]): CollisionHandler =>
    (a, b) => {
        for (const h of handlers) h(a, b);
    };
