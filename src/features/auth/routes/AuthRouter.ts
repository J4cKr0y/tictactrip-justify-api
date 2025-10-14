// src/features/auth/routes/AuthRouter.ts 

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/AuthService';

// Injection de dépendances
export const authService = new AuthService(); // Exporté pour être réutilisé dans les tests
const authController = new AuthController(authService);

const authRouter = Router();

// Endpoint: POST /api/token
authRouter.post('/token', authController.generateToken);

export default authRouter;