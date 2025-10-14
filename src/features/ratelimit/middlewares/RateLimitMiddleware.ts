// src/features/ratelimit/middlewares/RateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { RateLimitService } from '../services/RateLimitService';
import { JustifierService } from '../../justification/JustifierService';

export const createRateLimitMiddleware = (
    rateLimitService: RateLimitService
) => {
    
    return (req: Request, res: Response, next: NextFunction) => {
        const token = (req as any).clientToken as string; 
		// On ne connait pas le nombre de mots car on a pas encore parsé le texte
        let textBody = '';
        
        // On écoute le flux de données pour reconstruire le corps du texte
        req.on('data', (chunk) => {
            textBody += chunk.toString();
        });

        req.on('end', () => {
            // 1. Compter les mots dans le texte
            // Utiliser la même regex que le JustifierService
            const words = textBody.match(/\S+/g) || [];
            const wordCount = words.length;

            // 2. Vérifier la limite
            if (rateLimitService.isLimitExceeded(token, wordCount)) {
                // 402 Payment Required si la limite est atteinte
                return res.status(402).send('Payment Required: Daily word limit exceeded (80,000 words).');
            }
            
            // 3. Stocker le corps du texte et le compte de mots sur la requête 
            // pour que le contrôleur Justify n'ait pas à refaire le travail.
            (req as any).textBody = textBody;
            (req as any).wordCount = wordCount;

            // 4. Passer au contrôleur de justification
            next();
        });
        
        // Gestion des erreurs de flux
        req.on('error', (err) => {
            console.error('Stream error in RateLimitMiddleware:', err);
            res.status(500).send('Internal Server Error while reading request body.');
        });
    };
};