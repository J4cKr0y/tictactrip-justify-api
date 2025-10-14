// src/features/auth/Auth.integration.test.ts
import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from './middlewares/AuthMiddleware'; 
import authRouter, { authService } from './routes/AuthRouter'; 
const authMiddleware = createAuthMiddleware(authService); 

// Simuler l'application principale pour les tests d'intégration
const testApp = express();
testApp.use(express.json());

// 1. Monter le routeur d'authentification
testApp.use('/api', authRouter);

// 2. Créer une route bidon protégée par le middleware pour le test
testApp.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
    res.status(200).json({ message: 'Access granted', token: (req as any).clientToken });
});

describe('Auth Feature Integration (Router, Controller, Middleware)', () => {
    let validToken: string;
    const email = 'client@tictactrip.com';
    
    // --- Test de l'Endpoint /api/token ---
    describe('POST /api/token', () => {
        it('should return 200 and a token for a valid email', async () => {
            const response = await request(testApp)
                .post('/api/token')
                .send({ email: email })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            validToken = response.body.token; // Sauvegarder le token pour les tests suivants
        });

        it('should return 400 if email is missing', async () => {
            await request(testApp)
                .post('/api/token')
                .send({ notEmail: 'foo' })
                .expect(400);
        });
    });

    // --- Test du Middleware d'Authentification ---
    describe('AuthMiddleware on /api/protected', () => {
        it('should grant access (200) with a valid token', async () => {
            // Utilise le token obtenu dans le test précédent
            const response = await request(testApp)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);
            
            expect(response.body.message).toBe('Access granted');
            expect(response.body.token).toBe(validToken); // Vérifie que le token est attaché à la requête
        });

        it('should deny access (401) if token is missing', async () => {
            await request(testApp)
                .get('/api/protected')
                .expect(401)
                .then(res => {
                    expect(res.body.error).toContain('missing or malformed');
                });
        });

        it('should deny access (401) if token is invalid', async () => {
            await request(testApp)
                .get('/api/protected')
                .set('Authorization', 'Bearer invalid-token-xyz')
                .expect(401)
                .then(res => {
                    expect(res.body.error).toContain('Invalid token');
                });
        });

        it('should deny access (401) if Authorization header is malformed (not Bearer)', async () => {
            await request(testApp)
                .get('/api/protected')
                .set('Authorization', 'Token invalid-token-xyz')
                .expect(401);
        });
    });
});