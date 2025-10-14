// src/features/auth/controllers/AuthController.ts
import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
    private authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
    }

    /**
     * Gère la requête POST /api/token pour générer un token.
     */
    public generateToken = (req: Request, res: Response) => {
        const { email } = req.body;

        // Validation de base de l'email
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return res.status(400).json({ error: 'Email is required and must be valid.' });
        }

        const token = this.authService.generateToken(email);

        // Réponse conforme à la demande
        return res.status(200).json({ token });
    };
}