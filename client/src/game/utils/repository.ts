const STORAGE_KEY = 'xpr.playerName';

class Repository {
    resetAllVariables() {
        this.clearStoredName()
        fetch("http://localhost:8082/reset", { method: "POST" });
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
}

export const repository = new Repository();