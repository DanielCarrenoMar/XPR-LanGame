const STORAGE_KEY = 'xpr.playerName';
const BATTLE_MODE_STORAGE_KEY = 'xpr.isBattleMode';

class Repository {
    async resetAllVariables() {
        this.clearStoredName()
        this.clearStoredBattleMode()
        try {
            const res = await fetch("http://localhost:8082/reset", { method: "POST" });
            if (!res.ok) {
                throw new Error(`Failed to reset variables: ${res.statusText}`);
            }
        } catch (error) {
            throw new Error("Error al conectar con el servidor de resetear variables, Verifica que el servidor esté corriendo y accesible.");
        }
    }

    getStoredName(): string | null {
        try {
            const name = localStorage.getItem(STORAGE_KEY);
            return name && name.trim() ? name : null;
        } catch {
            return null;
        }
    }

    saveName(name: string): void {
        try {
            localStorage.setItem(STORAGE_KEY, name);
        } catch {
            // Ignore storage failures.
        }
    }

    clearStoredName(): void {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // Ignore storage failures.
        }
    }

    getStoredBattleMode(): boolean {
        try {
            const value = localStorage.getItem(BATTLE_MODE_STORAGE_KEY);
            if (value === 'true') return true;
            if (value === 'false') return false;
            return false;
        } catch {
            return false;
        }
    }

    saveBattleMode(active: boolean): void {
        try {
            localStorage.setItem(BATTLE_MODE_STORAGE_KEY, String(active));
        } catch {
            // Ignore storage failures.
        }
    }

    clearStoredBattleMode(): void {
        try {
            localStorage.removeItem(BATTLE_MODE_STORAGE_KEY);
        } catch {
            // Ignore storage failures.
        }
    }
}

export const repository = new Repository();