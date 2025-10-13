// src/server.ts
import express, { Application, Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

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