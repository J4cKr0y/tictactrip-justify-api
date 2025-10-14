// src/features/auth/services/AuthService.ts
import { randomUUID } from 'crypto';

/**
 * Service de gestion des tokens d'authentification.
 * Dans un environnement de production réel, ceci utiliserait une BDD (Redis/PostgreSQL).
 */
export class AuthService {
    // Simule un stockage de tokens actifs en mémoire (pour les besoins du MVP)
    private activeTokens: Set<string> = new Set();

    /**
     * Génère un token unique pour un utilisateur (simulé par l'email).
     * @param email L'email de l'utilisateur.
     * @returns Le token généré (UUID v4).
     */
    public generateToken(email: string): string {
        // En prod, on associerait cet email à un ID utilisateur
        const token = randomUUID();
        this.activeTokens.add(token); 
        return token;
    }

    /**
     * Vérifie si le token est actif et valide.
     * @param token Le token à vérifier.
     * @returns True si le token est valide, False sinon.
     */
    public isValidToken(token: string): boolean {
        // Vérifie si le token généré est dans notre liste de tokens "actifs"
        return this.activeTokens.has(token);
    }
}