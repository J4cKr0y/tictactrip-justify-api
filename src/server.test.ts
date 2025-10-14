// src/server.test.ts
import request from 'supertest';
import app from './server'; // L'application Express exportée

describe('Server startup', () => {
    it('should pass this dummy test and be ready to test the actual server', () => {
        expect(true).toBe(true);
    });
});

describe('Server health check', () => {
    // Test initial du serveur	
    it('should return 200 for the /health check', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('API Health Check OK');
    });

    // Test de la route Auth (test minimal d'intégration pour le router)
    it('should return 400 if POST /api/token is called without an email', async () => {
        const response = await request(app)
            .post('/api/token')
            .send({}); // Corps vide
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });
});