// src/features/ratelimit/middlewares/RateLimitMiddleware.test.ts
import { Request, Response, NextFunction } from 'express';
import { createRateLimitMiddleware } from './RateLimitMiddleware';
import { RateLimitService } from '../services/RateLimitService';
import { EventEmitter } from 'events';

// Mocks pour Express
// Utilise EventEmitter pour simuler les événements 'data' et 'end'
const mockRequest = (token: string, textBody: string): Partial<Request> & EventEmitter => {
    const req = new EventEmitter() as Partial<Request> & EventEmitter;
    
    // Simuler le token attaché par l'AuthMiddleware
    (req as any).clientToken = token;
    
    // Simuler la méthode "header"
    req.header = jest.fn((name: string) => {
        if (name.toLowerCase() === 'content-type') {
            return 'text/plain';
        }
        return undefined;
    }) as unknown as Request['header']; // On force le type pour satisfaire l'interface

    // Simuler les méthodes de stream
    setTimeout(() => {
        req.emit('data', textBody);
        req.emit('end');
    }, 5); // Petit délai pour s'assurer que le middleware a eu le temps de s'attacher aux événements

    return req;
};

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe('RateLimitMiddleware', () => {
    let rateLimitService: RateLimitService;
    let rateLimitMiddleware: (req: Request, res: Response, next: NextFunction) => void;
    const TEST_TOKEN = 'token-for-ratelimit';
    const TEST_TEXT = 'Ceci est un test de quatre mots.';
    const TEST_WORD_COUNT = 7; 

    beforeEach(() => {
        // Mocking du RateLimitService pour contrôler isLimitExceeded
        rateLimitService = {
            isLimitExceeded: jest.fn(),
            incrementWordCount: jest.fn(),
            getWordsConsumed: jest.fn()
        } as unknown as RateLimitService; 
        
        rateLimitMiddleware = createRateLimitMiddleware(rateLimitService);
        jest.clearAllMocks();
    });

    // Test 1: Succès (Limite OK)
    it('should call next() and attach textBody and wordCount to the request if limit is not exceeded', (done) => {
        // Arrange
        (rateLimitService.isLimitExceeded as jest.Mock).mockReturnValue(false);
        const req = mockRequest(TEST_TOKEN, TEST_TEXT) as Request;
        const res = mockResponse() as Response;

        // Act
        rateLimitMiddleware(req, res, mockNext);

        // Assertions asynchrones (après que end a été émis)
        (mockNext as jest.Mock).mockImplementation(() => {
            try {
                // 1. Vérifie que le service a été appelé correctement
                expect(rateLimitService.isLimitExceeded).toHaveBeenCalledWith(TEST_TOKEN, TEST_WORD_COUNT);
                
                // 2. Vérifie que la suite de la chaîne a été appelée
                expect(mockNext).toHaveBeenCalledTimes(1);

                // 3. Vérifie que les données ont été attachées à la requête ( pour le contrôleur)
                expect((req as any).textBody).toBe(TEST_TEXT);
                expect((req as any).wordCount).toBe(TEST_WORD_COUNT);
                
                // 4. Vérifie qu'aucune erreur n'a été renvoyée
                expect(res.status).not.toHaveBeenCalled();
                done();
            } catch (error) {
                done(error);
            }
        });
    });

    // Test 2: Échec (Limite dépassée)
    it('should return 402 Payment Required if limit is exceeded', (done) => {
        // Arrange
        (rateLimitService.isLimitExceeded as jest.Mock).mockReturnValue(true);
        const req = mockRequest(TEST_TOKEN, TEST_TEXT) as Request;
        const res = mockResponse() as Response;

        // Act
        rateLimitMiddleware(req, res, mockNext);

        // Assertions asynchrones
        // Le middleware DOIT renvoyer la réponse avant d'appeler next()
        setTimeout(() => {
            try {
                // 1. Vérifie que le service a été appelé
                expect(rateLimitService.isLimitExceeded).toHaveBeenCalledWith(TEST_TOKEN, TEST_WORD_COUNT);
                
                // 2. Vérifie la réponse d'erreur
                expect(res.status).toHaveBeenCalledWith(402);
                expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Payment Required'));

                // 3. Vérifie que next() n'a pas été appelé
                expect(mockNext).not.toHaveBeenCalled();

                done();
            } catch (error) {
                done(error);
            }
        }, 10);
    });
});