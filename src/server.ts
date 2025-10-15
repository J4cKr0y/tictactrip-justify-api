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

// Charger la spécification OpenAPI à partir du fichier YAML
const swaggerSpecPath = path.resolve(__dirname, '..', 'docs', 'swagger', 'swagger.json'); 
let swaggerDocument: object = {};

try {
    // Dans l'environnement de build (dist), le chemin doit être ajusté
    // Si vous êtes en mode dev, le chemin est correct.
    const finalPath = process.env.NODE_ENV === 'production' ? path.join(process.cwd(), 'dist', 'docs', 'swagger', 'swagger.json') : swaggerSpecPath;
    const fileContents = fs.readFileSync(finalPath, 'utf8');
    swaggerDocument = JSON.parse(fileContents.trim()); 
	
} catch (e) {
    console.error("Erreur lors du chargement de la spécification Swagger JSON:", e);
    // Si la doc ne charge pas, on continue l'exécution de l'API sans doc
}

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware de base
app.use(express.json());

// Route de Documentation Swagger
app.get('/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
});
app.use(
    '/api-docs', 
    swaggerUi.serve, 
    swaggerUi.setup(null, { // Le premier argument est null pour ne pas créer de conflit
        //  Pointer l'interface vers le chemin dédié
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