// src/server.ts
import express, { Application, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import authRouter from './features/auth/routes/AuthRouter'; 
import justifyRouter from './features/justification/routes/JustifyRouter'; 



dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(express.json());
// Routes
app.use('/api', authRouter); 
app.use('/api', justifyRouter);


// Route de test pour la santé du serveur
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('API Health Check OK');
});

// Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}

export default app;