// src/features/justification/Justify.integration.test.ts
import request from 'supertest';
import app from '../../server'; 
import { authService } from '../../features/auth/routes/AuthRouter';
import { rateLimitService } from './routes/JustifyRouter';
import { JustifierService } from '../justification/JustifierService';

describe('Justify Feature End-to-End Integration (/api/justify)', () => {
    let clientToken: string;
    const testEmail = 'test.justify@tictactrip.com';
    const JUSTIFY_ENDPOINT = '/api/justify';

    // Un long texte pour dépasser les lignes et atteindre la limite de mots
    const baseText = "Le développement de cette API REST est un excellent exercice de TDD et de séparation des préoccupations. Nous appliquons les principes SOLID en isolant chaque fonctionnalité dans son propre service et en utilisant des middlewares pour orchestrer le flux de données. Le respect des 80 caractères par ligne est la contrainte métier la plus intéressante, car elle exige un algorithme maison. La limite de 80 000 mots par jour assure que l'API est utilisable mais protégée contre les abus. Tictactrip s'assure ainsi d'une bonne gestion de ses ressources.";
    
    // Le texte final doit être exactement 80 caractères.
    const expectedJustifiedStart = new JustifierService().justify(baseText).split('\n')[0];
    const baseWordCount = (baseText.match(/\S+/g) || []).length; // ~73 mots

    // 1. Pré-requis : Obtenir un token valide
    beforeAll(async () => {
        await request(app)
            .post('/api/token')
            .send({ email: testEmail });
        
        // Récupérer le token généré pour cet email (l'AuthService est un singleton en mémoire)
        clientToken = (authService as any).activeTokens.values().next().value; 
    });

    // Nettoyage : Réinitialiser le compteur de mots pour le token de test
    beforeEach(() => {
        // En forçant le reset ici, on s'assure que le test de dépassement est propre
        (rateLimitService as any).usageMap.delete(clientToken); 
    });

    // --- Test 1: Succès de la justification avec Content-Type correct ---
    it('should return 200 and a justified text of 80 chars with a valid token and text/plain body', async () => {
        const response = await request(app)
            .post(JUSTIFY_ENDPOINT)
            .set('Authorization', `Bearer ${clientToken}`)
            .set('Content-Type', 'text/plain')
            .send(baseText)
            .expect(200);

        // 1. Vérification du Content-Type de la réponse
        expect(response.header['content-type']).toContain('text/plain');
        
        const lines = response.text.split('\n');

        // 2. Vérification de la justification
        expect(lines[0]).toBe(expectedJustifiedStart);
        expect(lines[0].length).toBe(80);
        
        // 3. Vérification de la consommation de mots (doit être enregistrée)
        expect(rateLimitService.getWordsConsumed(clientToken)).toBe(baseWordCount);
    });
    
    // --- Test 2: Rejet sans token (AuthMiddleware) ---
    it('should return 401 Unauthorized if token is missing', async () => {
        await request(app)
            .post(JUSTIFY_ENDPOINT)
            .set('Content-Type', 'text/plain')
            .send(baseText)
            .expect(401);
            
        // Le compteur NE DOIT PAS avoir bougé
        expect(rateLimitService.getWordsConsumed(clientToken)).toBe(0);
    });
    
    // --- Test 3: Rejet si Content-Type est incorrect ---
    it('should return 415 Unsupported Media Type if Content-Type is application/json', async () => {
        // Remarque: L'erreur 415 est gérée dans le JustifyController pour ce cas
        await request(app)
            .post(JUSTIFY_ENDPOINT)
            .set('Authorization', `Bearer ${clientToken}`)
            .set('Content-Type', 'application/json')
            .send(JSON.stringify({ text: baseText }))
            .expect(415);

        // Le compteur NE DOIT PAS avoir bougé
        expect(rateLimitService.getWordsConsumed(clientToken)).toBe(0);
    });

    // --- Test 4: Dépassement de la limite de mots (RateLimitMiddleware) ---
    it('should return 402 Payment Required when the 80,000 word limit is exceeded', async () => {
        // Consommer la quasi-totalité de la limite
        const largeConsume = 79950;
        rateLimitService.incrementWordCount(clientToken, largeConsume);
        expect(rateLimitService.getWordsConsumed(clientToken)).toBe(largeConsume);

        // Tentative d'envoyer un texte de 73 mots (la consommation totale dépassera 80 000)
        await request(app)
            .post(JUSTIFY_ENDPOINT)
            .set('Authorization', `Bearer ${clientToken}`)
            .set('Content-Type', 'text/plain')
            .send(baseText) // baseWordCount = 73
            .expect(402)
            .then(res => {
                expect(res.text).toContain('Payment Required');
            });
        
        // Le compteur NE DOIT PAS AVOIR ÉTÉ INCÉMENTÉ 
        expect(rateLimitService.getWordsConsumed(clientToken)).toBe(largeConsume);
    });
});