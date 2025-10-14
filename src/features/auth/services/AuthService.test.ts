// src/features/auth/services/AuthService.test.ts
import { AuthService } from './AuthService';

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        authService = new AuthService();
    });

    // Test 1: Génération de token
    it('should generate a unique token for a given email', () => {
        const email = 'test@tictactrip.com';
        const token = authService.generateToken(email);
        
        // Un token doit être une chaîne non vide
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(10); 
        // Vérifier l'unicité (simplement s'assurer qu'il n'est pas statique)
        expect(authService.generateToken('another@email.com')).not.toBe(token);
    });

    // Test 2: Validation de token (simplement la vérification d'existence pour l'instant)
    it('should return true for a recently generated token (simulated valid token)', () => {
        // Dans ce MVP, on suppose que tout token généré par l'algorithme est valide
        const validToken = authService.generateToken('valid@email.com');
        expect(authService.isValidToken(validToken)).toBe(true);
    });
    
    // Test 3: Validation de token invalide
    it('should return false for an invalid or non-existent token', () => {
        expect(authService.isValidToken('invalid-token-123')).toBe(false);
    });
});