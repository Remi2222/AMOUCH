# Guide de Démarrage Sans Docker

## Prérequis

1. **Node.js 16+** - [Télécharger](https://nodejs.org)
2. **MySQL 8+** - [Télécharger](https://dev.mysql.com/downloads/mysql/)

## Installation Rapide

### Étape 1: Configurer les fichiers .env

```powershell
.\setup-env.ps1
```

Entrez votre mot de passe MySQL root quand demandé.

### Étape 2: Créer la base de données

Ouvrez MySQL:
```bash
mysql -u root -p
```

Créez la base de données:
```sql
CREATE DATABASE amouch_db;
exit
```

### Étape 3: Importer le schéma

```bash
mysql -u root -p amouch_db < init.sql
```

### Étape 4: Démarrer l'application

```powershell
.\start-dev.ps1
```

Le script va:
- ✓ Vérifier Node.js et MySQL
- ✓ Installer toutes les dépendances
- ✓ Démarrer les 6 microservices
- ✓ Démarrer le frontend React

## Accès à l'Application

- **Frontend**: http://localhost:3000
- **API Animaux**: http://localhost:3001
- **API Vétérinaire**: http://localhost:3002
- **API Adoptions**: http://localhost:3003
- **API Sensibilisation**: http://localhost:3004
- **API Réservations**: http://localhost:3005
- **API Stocks**: http://localhost:3006

## Arrêter l'Application

Fermez toutes les fenêtres PowerShell qui ont été ouvertes.

## Installation Manuelle (Alternative)

Si les scripts ne fonctionnent pas:

### 1. Créer manuellement les fichiers .env

Dans chaque dossier `services/[nom-service]/`, créez un fichier `.env`:

```env
PORT=300X
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=amouch_db
```

Ports:
- animals: 3001
- veterinary: 3002
- adoptions: 3003
- awareness: 3004
- reservations: 3005
- stocks: 3006

### 2. Installer les dépendances

```bash
# Frontend
cd frontend
npm install

# Chaque service
cd services/animals && npm install
cd ../veterinary && npm install
cd ../adoptions && npm install
cd ../awareness && npm install
cd ../reservations && npm install
cd ../stocks && npm install
```

### 3. Démarrer manuellement

Ouvrez 7 terminaux et dans chacun:

```bash
# Terminal 1
cd frontend && npm start

# Terminal 2
cd services/animals && npm start

# Terminal 3
cd services/veterinary && npm start

# Terminal 4
cd services/adoptions && npm start

# Terminal 5
cd services/awareness && npm start

# Terminal 6
cd services/reservations && npm start

# Terminal 7
cd services/stocks && npm start
```

## Dépannage

### MySQL ne démarre pas
- Windows: Démarrer le service MySQL depuis Services (services.msc)
- Vérifier: `mysql -u root -p`

### Port déjà utilisé
```powershell
# Trouver le processus
netstat -ano | findstr :3000

# Arrêter le processus
taskkill /PID <PID> /F
```

### Erreur de connexion à la base de données
- Vérifiez le mot de passe dans les fichiers .env
- Vérifiez que MySQL est démarré
- Vérifiez que la base de données `amouch_db` existe

### Les modules npm ne s'installent pas
```bash
# Nettoyer le cache npm
npm cache clean --force

# Réinstaller
npm install
```

## Support

Pour toute question, vérifiez:
1. Node.js est installé: `node --version`
2. MySQL est en cours: `mysql -u root -p`
3. Les fichiers .env existent dans tous les services
4. La base de données amouch_db existe


