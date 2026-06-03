import { BaseProyectil } from '#entities/proyectil/BaseProyectil.ts';

interface ShieldLike {
    active: boolean;
    ownerId?: number | null;
}

export default function makeShieldBlockHandler() {
    return (bullet: BaseProyectil, shield: ShieldLike): void => {
        if (!bullet || !shield || !bullet.active || !shield.active || !bullet.body) {
            return;
        }

        if (bullet.getOwnerId() === shield.ownerId) {
            return;
        }

        bullet.destroy();
    };
}
