// src/features/auth/middlewares/AuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

// Le service doit être passé en paramètre ou injecté pour une bonne séparation
export const createAuthMiddleware = (authService: AuthService) => {
    
    return (req: Request, res: Response, next: NextFunction) => {
        // Le token est attendu dans le header "Authorization: Bearer <token>"
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Statut 401 Unauthorized si le header est absent ou mal formé
            return res.status(401).json({ error: 'Unauthorized: Bearer token missing or malformed.' });
        }

        const token = authHeader.split(' ')[1];

        if (!authService.isValidToken(token)) {
            // Statut 401 Unauthorized si le token est invalide
            return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
        }
        
        // 🚨 IMPORTANT : Attacher le token (ou l'ID utilisateur) à l'objet Request
        // pour que le middleware de Rate Limit puisse y accéder.
        // On étend le type Express.Request pour y inclure le token.
        (req as any).clientToken = token; 

        // Passer à la prochaine fonction/middleware/contrôleur
        next();
    };
};