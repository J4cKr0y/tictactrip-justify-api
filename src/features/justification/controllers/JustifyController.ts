// src/features/justification/controllers/JustifyController.ts
import { Request, Response } from 'express';
import { JustifierService } from '../JustifierService';
import { RateLimitService } from '../../ratelimit/services/RateLimitService';

export class JustifyController {
    private justifierService: JustifierService;
    private rateLimitService: RateLimitService;

    constructor(
        justifierService: JustifierService, 
        rateLimitService: RateLimitService
    ) {
        this.justifierService = justifierService;
        this.rateLimitService = rateLimitService;
    }

    /**
     * Endpoint POST /api/justify.
     * Attend un body text/plain.
     */
    public justifyText = (req: Request, res: Response) => {
        // 🚨 Les données ont été attachées par le RateLimitMiddleware
        const textBody = (req as any).textBody as string;
        const wordCount = (req as any).wordCount as number;
        const token = (req as any).clientToken as string;

        // 1. Double vérification du Content-Type (même si le RateLimitMiddleware l'a géré)
        if (req.header('Content-Type') !== 'text/plain') {
             // 415 Unsupported Media Type est plus approprié pour un Content-Type incorrect
            return res.status(415).send('Unsupported Media Type. Expected Content-Type: text/plain');
        }

        // Le RateLimitMiddleware a déjà vérifié si la limite est dépassée.
        // Ici, on vérifie seulement si le RateLimitMiddleware a mis le corps du texte
        if (typeof textBody !== 'string') {
            return res.status(400).send('Request body must contain text/plain content.');
        }

        // 2. Justification du texte (Logique métier)
        const justifiedText = this.justifierService.justify(textBody);

        // 3. 🚨 Mettre à jour la consommation de mots (Contrainte de Rate Limit)
        const incrementSuccess = this.rateLimitService.incrementWordCount(token, wordCount);
        
        // Théoriquement, ça devrait toujours être true car le middleware a déjà vérifié,
        // mais c'est une sécurité. Si le middleware a échoué, on renvoie 402.
        if (!incrementSuccess) {
            return res.status(402).send('Payment Required: Daily word limit exceeded (80,000 words).');
        }

        // 4. Réponse
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send(justifiedText);
    };
}