// src/features/ratelimit/services/RateLimitService.ts

interface TokenUsage {
    words: number;
    lastUsedDate: string; // Format YYYY-MM-DD
}

/**
 * Service de gestion de la limite de mots par jour et par token.
 */
export class RateLimitService {
    // 80 000 mots par jour
    private readonly DAILY_LIMIT = 80000; 

    // Stockage en mémoire : clé = token, valeur = TokenUsage
    private usageMap: Map<string, TokenUsage> = new Map();

    /**
     * Retourne la date du jour au format YYYY-MM-DD.
     */
    private getCurrentDate(): string {
        return new Date().toISOString().slice(0, 10);
    }

    /**
     * Récupère la consommation actuelle et la réinitialise si un nouveau jour est passé.
     */
    private getOrCreateUsage(token: string): TokenUsage {
        const currentDate = this.getCurrentDate();
        let usage = this.usageMap.get(token);

        if (!usage || usage.lastUsedDate !== currentDate) {
            // Nouveau jour ou nouveau token : réinitialisation
            usage = { words: 0, lastUsedDate: currentDate };
            this.usageMap.set(token, usage);
        }
        
        return usage;
    }

    /**
     * Vérifie si l'ajout des mots dépasserait la limite.
     */
    public isLimitExceeded(token: string, newWords: number): boolean {
        const usage = this.getOrCreateUsage(token);
        return usage.words + newWords > this.DAILY_LIMIT;
    }
    
    /**
     * Incrémente le compteur de mots pour le token.
     * @param token Le token du client.
     * @param words Le nombre de mots à ajouter.
     * @returns True si l'incrémentation a réussi, False si la limite est dépassée.
     */
    public incrementWordCount(token: string, words: number): boolean {
        const usage = this.getOrCreateUsage(token);

        if (usage.words + words > this.DAILY_LIMIT) {
            return false; // Limite dépassée, ne pas incrémenter
        }

        usage.words += words;
        // La date est déjà mise à jour par getOrCreateUsage si nécessaire

        return true;
    }

    /**
     * Retourne le nombre de mots consommés aujourd'hui. (Pour les tests)
     */
    public getWordsConsumed(token: string): number {
        return this.getOrCreateUsage(token).words;
    }
}