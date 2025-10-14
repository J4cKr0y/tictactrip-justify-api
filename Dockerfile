# Dockerfile

# =========================================================
# ÉTAPE 1: BUILD (Compilation du TypeScript)
# Base légère et rapide pour la compilation
# =========================================================
FROM node:20-alpine AS builder

# Définir le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers de dépendance pour optimiser le cache Docker
COPY package.json package-lock.json ./

# Installer toutes les dépendances (y compris devDependencies pour la compilation)
# Ajout du flag --quiet pour des logs plus propres
RUN npm ci

# Copier le reste du code source
COPY . .

# Exécuter explicitement le build, PUIS le bundling de la doc.
RUN npm run build
RUN npm run doc:bundle 


# =========================================================
# ÉTAPE 2: PRODUCTION (Image finale très légère)
# Utilisation de la même base pour la compatibilité, mais sans outils de développement
# =========================================================
FROM node:20-alpine AS final

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers essentiels de l'étape builder:
# 1. Copier les fichiers package pour permettre un 'npm install --omit=dev'
COPY --from=builder /app/package.json ./
# 2. Copier le code compilé (dist)
COPY --from=builder /app/dist ./dist
# 3. Copier la documentation bundle (.json) pour Swagger UI
# Le chemin de la doc est critique, nous supposons qu'elle est à la racine après le build
COPY --from=builder /app/docs/swagger/swagger.json ./docs/swagger/swagger.json

# Installer les dépendances de production UNIQUEMENT (très léger et rapide)
RUN npm install --omit=dev --quiet

# Exposer le port par défaut (Render injecte le port d'écoute dans $PORT)
EXPOSE 3000

# Commande de démarrage du serveur (exécute node dist/server.js)
CMD ["npm", "start"]