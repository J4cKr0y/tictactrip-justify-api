// src/server.ts
 
import express, { Application, Request, Response } from 'express';
import * as dotenv from 'dotenv';
import authRouter from './features/auth/routes/AuthRouter';
import justifyRouter from './features/justification/routes/JustifyRouter'; 
import swaggerUi from 'swagger-ui-express';
import * as YAML from 'js-yaml'; 
import * as path from 'path';
import * as fs from 'fs'; 

dotenv.config();

// Charger la spécification OpenAPI à partir du fichier JSON
const swaggerSpecPath = path.resolve(__dirname, '..', 'docs', 'swagger', 'swagger.json'); 
let swaggerDocument: object = {};

try {
    const fileContents = fs.readFileSync(swaggerSpecPath, 'utf8'); 
    swaggerDocument = JSON.parse(fileContents.trim()); 
	
} catch (e) {
    console.error("Erreur lors du chargement de la spécification Swagger JSON:", e);
    // Ceci s'exécutera si le fichier n'est pas trouvé, laissant swaggerDocument vide.
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(express.json());

// Route de Documentation Swagger
app.get('/swagger.json', (req, res) => {
    res.json(swaggerDocument);
});
app.use(
    '/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(null, { 
        swaggerOptions: {
            url: '/swagger.json',
			// Option tryItOutEnabled À DÉCOMMENTER EN CONDITION REEL
			//tryItOutEnabled: process.env.NODE_ENV !== 'production',
        }
    })
);


// Route de test pour la santé du serveur
app.get('/health', (req: Request, res: Response) => {
    res.status(200).send('API Health Check OK');
});

// Routes
app.use('/api', authRouter); 
app.use('/api', justifyRouter);

// Démarrage du serveur
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
		console.log(`Documentation available on http://localhost:${PORT}/api-docs`);
    });
}

export default app;