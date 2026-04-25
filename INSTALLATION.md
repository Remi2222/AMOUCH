# Guide d'Installation - AMOUCH

## Installation Rapide avec Docker (Recommandé)

### Prérequis
- Docker Desktop installé
- Port 3000, 3001, 3002, 3003, 3306 disponibles

### Étapes

1. **Lancer tous les services**
```bash
docker-compose up -d
```

2. **Vérifier que tout fonctionne**
```bash
docker-compose ps
```

3. **Accéder à l'application**
- Frontend: http://localhost:3000
- Service Animaux: http://localhost:3001/health
- Service Réservations: http://localhost:3002/health
- Service Stocks: http://localhost:3003/health

4. **Voir les logs**
```bash
docker-compose logs -f
```

5. **Arrêter les services**
```bash
docker-compose down
```

## Installation Manuelle (Développement)

### Prérequis
- Node.js 16+
- MySQL 8+
- npm ou yarn

### Étape 1: Configurer MySQL

1. Installer MySQL 8.0
2. Créer la base de données:
```sql
CREATE DATABASE amouch_db;
```
3. Importer le schéma:
```bash
mysql -u root -p amouch_db < init.sql
```

### Étape 2: Installer les dépendances

```bash
# Installer toutes les dépendances
npm run install:all
```

Ou manuellement:
```bash
# Frontend
cd frontend
npm install

# Service Animaux
cd ../services/animals
npm install

# Service Réservations
cd ../reservations
npm install

# Service Stocks
cd ../stocks
npm install
```

### Étape 3: Configurer les variables d'environnement

Créer les fichiers `.env` dans chaque service:

**services/animals/.env**
```
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=amouch_db
```

**services/reservations/.env**
```
PORT=3002
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=amouch_db
```

**services/stocks/.env**
```
PORT=3003
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=amouch_db
```

### Étape 4: Lancer les services

Ouvrir 4 terminaux différents:

**Terminal 1 - Frontend**
```bash
cd frontend
npm start
```

**Terminal 2 - Service Animaux**
```bash
cd services/animals
npm run dev
```

**Terminal 3 - Service Réservations**
```bash
cd services/reservations
npm run dev
```

**Terminal 4 - Service Stocks**
```bash
cd services/stocks
npm run dev
```

### Étape 5: Accéder à l'application

- Frontend: http://localhost:3000
- API Animaux: http://localhost:3001
- API Réservations: http://localhost:3002
- API Stocks: http://localhost:3003

## Résolution des Problèmes

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>
```

### Erreur de connexion MySQL
- Vérifier que MySQL est démarré
- Vérifier les identifiants dans les fichiers .env
- Vérifier que la base de données existe

### Erreur CORS
- Vérifier que tous les services sont démarrés
- Vérifier les URLs dans le frontend (.env du frontend)

## Scripts Utiles

```bash
# Installer toutes les dépendances
npm run install:all

# Lancer avec Docker
npm run docker:up

# Arrêter Docker
npm run docker:down

# Voir les logs Docker
npm run docker:logs
```


