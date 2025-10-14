// src/server.ts
import express, { Application, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import authRouter from './features/auth/routes/AuthRouter';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(express.json());

// Route de test pour la santé du serveur
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('API Health Check OK');
});

// Route d'Authentification
app.use('/api', authRouter); 


// Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

export default app;