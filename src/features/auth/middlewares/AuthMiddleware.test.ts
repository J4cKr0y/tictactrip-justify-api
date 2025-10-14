// src/features/auth/middlewares/AuthMiddleware.test.ts
import { Request, Response, NextFunction } from 'express';
import { createAuthMiddleware } from './AuthMiddleware';
import { AuthService } from '../services/AuthService';

// Créer des Mocks pour Express
const mockRequest = (headers: any = {}): Partial<Request> => ({
    headers: headers,
});

const mockResponse = (): Partial<Response> => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext: NextFunction = jest.fn();

describe('AuthMiddleware', () => {
    let authService: AuthService;
    let authMiddleware: (req: Request, res: Response, next: NextFunction) => void;

    beforeEach(() => {
        // Mocking du AuthService pour contrôler isValidToken
        authService = {
            isValidToken: jest.fn(),
            generateToken: jest.fn(), // Non utilisé ici, mais nécessaire pour l'interface
        } as unknown as AuthService; 
        
        // Création du middleware avec le service mocké
        authMiddleware = createAuthMiddleware(authService);
        
        // Réinitialisation des mocks entre les tests
        jest.clearAllMocks();
    });

    // Test 1: Succès (Token valide)
    it('should call next() and set clientToken on success with a valid Bearer token', () => {
        const token = 'valid-token-123';
        (authService.isValidToken as jest.Mock).mockReturnValue(true);

        const req = mockRequest({ authorization: `Bearer ${token}` }) as Request;
        const res = mockResponse() as Response;

        authMiddleware(req, res, mockNext);

        // 1. Vérifie que le service a été appelé correctement
        expect(authService.isValidToken).toHaveBeenCalledWith(token);
        // 2. Vérifie que la chaîne a été appelée
        expect(mockNext).toHaveBeenCalledTimes(1);
        // 3. Vérifie que le token a été attaché à la requête (crucial pour le Rate Limit)
        expect((req as any).clientToken).toBe(token);
        // 4. Vérifie que res.status et res.json n'ont pas été appelés
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    // Test 2: Échec (Header manquant)
    it('should return 401 if Authorization header is missing', () => {
        const req = mockRequest({}) as Request;
        const res = mockResponse() as Response;

        authMiddleware(req, res, mockNext);

        // 1. Vérifie la réponse d'erreur
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Bearer token missing or malformed.' });
        // 2. Vérifie que la suite de la chaîne n'a pas été appelée
        expect(mockNext).not.toHaveBeenCalled();
        // 3. Le service de validation ne devrait même pas être appelé
        expect(authService.isValidToken).not.toHaveBeenCalled();
    });

    // Test 3: Échec (Format malformé)
    it('should return 401 if Authorization header is malformed (not Bearer)', () => {
        const req = mockRequest({ authorization: 'Basic YWxhZGRpbjpvcGVuc2VzYW1l' }) as Request;
        const res = mockResponse() as Response;

        authMiddleware(req, res, mockNext);

        // 1. Vérifie la réponse d'erreur
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Bearer token missing or malformed.' });
        // 2. Vérifie que next() n'a pas été appelé
        expect(mockNext).not.toHaveBeenCalled();
    });

    // Test 4: Échec (Token invalide)
    it('should return 401 if the token is invalid according to AuthService', () => {
        const token = 'invalid-token-456';
        (authService.isValidToken as jest.Mock).mockReturnValue(false);

        const req = mockRequest({ authorization: `Bearer ${token}` }) as Request;
        const res = mockResponse() as Response;

        authMiddleware(req, res, mockNext);

        // 1. Vérifie que le service a été appelé
        expect(authService.isValidToken).toHaveBeenCalledWith(token);
        // 2. Vérifie la réponse d'erreur
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized: Invalid token.' });
        // 3. Vérifie que next() n'a pas été appelé
        expect(mockNext).not.toHaveBeenCalled();
    });
});