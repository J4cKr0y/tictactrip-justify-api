// src/features/ratelimit/services/RateLimitService.test.ts
import { RateLimitService } from './RateLimitService';

// Mock du temps pour simuler le passage d'un jour
const mockDate = (dateString: string) => {
    jest.useFakeTimers().setSystemTime(new Date(dateString));
};

describe('RateLimitService', () => {
    let rateLimitService: RateLimitService;
    const TEST_TOKEN = 'test-client-token';
    const LIMIT = 80000;

    beforeEach(() => {
        // Réinitialiser le service pour chaque test
        rateLimitService = new RateLimitService();
        // Commencer au début du jour J
        mockDate('2025-10-14T10:00:00.000Z');
    });

    afterAll(() => {
        // Rétablir les vraies fonctions de temps après tous les tests
        jest.useRealTimers();
    });

    // Test 1: Vérification initiale (pas de consommation)
    it('should return 0 words consumed initially for a new token', () => {
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(0);
    });

    // Test 2: Incrémentation et vérification
    it('should correctly increment the word count for a token', () => {
        rateLimitService.incrementWordCount(TEST_TOKEN, 50000);
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(50000);

        rateLimitService.incrementWordCount(TEST_TOKEN, 15000);
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(65000);
    });

    // Test 3: Dépassement de la limite
    it('should correctly report if the limit is exceeded', () => {
        // Consommer juste en dessous de la limite
        rateLimitService.incrementWordCount(TEST_TOKEN, LIMIT - 1000);
        expect(rateLimitService.isLimitExceeded(TEST_TOKEN, 1000)).toBe(false); // Dernier mot qui passe

        // Tenter d'ajouter 1 mot de plus (dépassement)
        expect(rateLimitService.isLimitExceeded(TEST_TOKEN, 1001)).toBe(true);
    });

    // Test 4: Réinitialisation journalière (le cœur de la contrainte)
    it('should reset the word count after a day passes', () => {
        // Consommer 70000 mots le jour J (14/10)
        rateLimitService.incrementWordCount(TEST_TOKEN, 70000);
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(70000);

        // Simuler le passage au jour J+1 (15/10)
        mockDate('2025-10-15T00:00:01.000Z'); 

        // La consommation devrait être réinitialisée pour le token
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(0); 

        // Nouvelle consommation le jour J+1
        rateLimitService.incrementWordCount(TEST_TOKEN, 1000);
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(1000);
    });
    
    // Test 5: Comportement atomique (passer/échouer)
    it('should prevent incrementation if the limit would be exceeded', () => {
        rateLimitService.incrementWordCount(TEST_TOKEN, LIMIT - 500);
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(LIMIT - 500);

        // Tentative d'ajouter 1000 mots (devrait échouer)
        const success = rateLimitService.incrementWordCount(TEST_TOKEN, 1000);
        expect(success).toBe(false);
        
        // Le compteur NE DOIT PAS avoir bougé
        expect(rateLimitService.getWordsConsumed(TEST_TOKEN)).toBe(LIMIT - 500);
    });
});