// src/features/justification/routes/JustifyRouter.ts
import { Router } from 'express';

// Dépendances des features
import { JustifierService } from '../JustifierService';
import { RateLimitService } from '../../ratelimit/services/RateLimitService';
import { authService } from '../../auth/routes/AuthRouter'; // Instance unique
// Middlewares et Controller
import { JustifyController } from '../controllers/JustifyController';
import { createAuthMiddleware } from '../../auth/middlewares/AuthMiddleware';
import { createRateLimitMiddleware } from '../../ratelimit/middlewares/RateLimitMiddleware';

// 1. Injection des dépendances
const justifierService = new JustifierService();
// Une nouvelle instance de RateLimitService (pas besoin de la partager avec l'AuthService)
export const rateLimitService = new RateLimitService(); 

const justifyController = new JustifyController(
    justifierService,
    rateLimitService
);

// 2. Création des Middlewares
const authMiddleware = createAuthMiddleware(authService);
const rateLimitMiddleware = createRateLimitMiddleware(rateLimitService);

const justifyRouter = Router();

// 3. Endpoint /api/justify avec la chaîne de middlewares
justifyRouter.post(
    '/justify', 
    authMiddleware, 
    rateLimitMiddleware, 
    justifyController.justifyText
);

export default justifyRouter;