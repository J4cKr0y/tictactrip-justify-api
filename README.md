# Tictactrip Justify API

## Projet
------
Conception et développement d'une API RESTful en Node.js/TypeScript pour la justification de texte. 
L'API implémente des contraintes d'affaires strictes, notamment l'authentification via Bearer Token et une limitation de débit journalière de 80 000 mots par utilisateur.


## C'est quoi ?
------------
Cette API a pour fonction principale de prendre un texte brut et de le renvoyer formaté, où chaque ligne de la sortie est justifiée pour atteindre exactement 80 colonnes. 
Le projet est construit sur les principes du Test-Driven Development (TDD), assurant la robustesse du code pour les middlewares critiques (Authentification et Limiteur de Débit) et la logique métier (Justification de Texte).


## Fonctionnalités et Contraintes Clés
-----------------------
- Authentification Sécurisée: Utilisation d'un Bearer Token (UUID) pour identifier les clients.

- Limite de Débit (Rate Limiting): Un middleware dédié bloque l'accès (402 Payment Required) si l'utilisateur dépasse la limite de 80 000 mots consommés par jour.

- Logique de Justification: L'endpoint /api/justify implémente un algorithme pour formater le texte à 80 caractères par ligne.

- Documentation OpenAPI: Spécification complète de l'API via des fichiers YAML et exposée via Swagger UI.


## Technologies Utilisées
-----------------------
- **Backend**: Node.js, Express.js, TypeScript
- **Testing & Quality**: Jest, Supertest
- **Documentation**: OpenAPI 3.0 (YAML), Swagger UI Express, swagger-cli
- **Conteneurisation**: Docker (Image Alpine)
- **Deployment**: Render (Tier Gratuit)

![Node.js](https://img.shields.io/badge/Node.js-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.x-blue)
![Express.js](https://img.shields.io/badge/Express.js-green)


## Architecture du Projet
------------------------
Le projet suit le principe de Séparation des Préoccupations (Separation of Concerns) et est organisé en modules (features) :
```
tictactrip-justify-api/
├── docs/ 					# Fichiers de spécification OpenAPI (YAML/JSON)
├── src/
│   ├── features/
│   │   ├── auth/ 			# Logique d'authentification (Service, Controller, Middleware)
│   │   ├── justification/ 	# Logique métier de justification (Service, Controller)
│   │   └── ratelimit/ 		# Middleware et Service de limitation de débit
│   ├── server.ts 			# Point d'entrée de l'API (Express) et Swagger Setup
├── .dockerignore 			# Fichiers ignorés par la construction Docker
├── Dockerfile 				# Image de production basée sur Alpine (Multi-stage build)
└── package.json 			# Dépendances et scripts de build
```
L'architecture utilise l'Injection de Dépendances pour lier les services aux contrôleurs et aux middlewares, facilitant ainsi les tests unitaires et l'extensibilité.


## Par quoi commencer ? 
--------------------
### Déploiement Public
Si vous voulez juste tester l'API, elle est déployée sur Render :

- API de Base : https://tictactrip-justify-api.onrender.com

- Documentation Swagger : https://tictactrip-justify-api.onrender.com/api-docs

Comme c'est la version gratuite, elle sera peut-être "en veille" quand vous arriverez, je vous demanderais un peu de patience avant que Rage Quit!

### Lancement Local (Développement)
1. Téléchargez le projet, installez les dépendances : 
```
npm install
```

2. Lancez le serveur : 
```
npm run dev
```

Le serveur démarrera sur  [http://localhost:3000](http://localhost:3000). 
Pour Exécuter les Tests et valider l'intégrité de toutes les fonctionnalités :
```
npm test
```
Ouvrez [http://localhost:3000/api-docs](http://localhost:3000/api-docs) dans votre navigateur pour accéder à la documentation et interagir avec l'API.


## Roadmap et Améliorations Prévues
----------------------------------
- [] Remplacer le stockage de tokens et de limites en mémoire (Set, Map) par une solution de persistance (ex: Redis).

- [] Améliorer l'algorithme de justification pour gérer les cas limites (mots plus longs que 80 colonnes, caractères spéciaux, etc.).

- [] Ajouter un meilleur système de logs et de surveillance.

- [] Implémenter une gestion des erreurs centralisée (ex: error handler global).