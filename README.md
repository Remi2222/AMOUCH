# AMOUCH - Plateforme Vétérinaire & Adoption - المغرب

منصة شاملة لإدارة الطب البيطري وتبني الحيوانات في المغرب
Plateforme complète pour la gestion vétérinaire, l'adoption d'animaux et la sensibilisation au Maroc.

## 🚀 Technologies

- **Frontend**: React.js
- **Backend**: Node.js avec architecture microservices
- **Base de données**: MySQL
- **Conteneurisation**: Docker

## 📋 Fonctionnalités

### 🐾 Gestion des Animaux
- ✅ Profils complets (âge, poids, race, couleur, sexe)
- ✅ Statut de santé et comportement
- ✅ Statut d'adoption
- ✅ Photos et descriptions détaillées

### 🏥 Module Vétérinaire
- ✅ Dossiers médicaux complets
- ✅ Historique des consultations
- ✅ Gestion des vaccinations
- ✅ Base de données des médicaments
- ✅ Suivi des traitements
- ✅ Rappels de vaccinations

### 💊 Gestion des Médicaments
- ✅ Catalogue complet des médicaments
- ✅ Gestion des stocks pharmaceutiques
- ✅ Dates d'expiration
- ✅ Prescriptions et dosages
- ✅ Effets secondaires

### 🏠 Module d'Adoption
- ✅ Demandes d'adoption en ligne
- ✅ Processus d'approbation
- ✅ Visites à domicile
- ✅ Contrats d'adoption
- ✅ Suivi post-adoption

### 📢 Sensibilisation
- ✅ Campagnes de sensibilisation
- ✅ Éducation et prévention
- ✅ Articles de santé animale
- ✅ Conseils d'adoption

### 📦 Gestion des Stocks
- ✅ Produits alimentaires
- ✅ Matériel médical
- ✅ Accessoires
- ✅ Alertes de réapprovisionnement

## 🏗️ Architecture

```
amouche/
├── frontend/              # Application React.js
├── services/
│   ├── animals/          # Service gestion animaux
│   ├── veterinary/       # Service vétérinaire (santé, médicaments)
│   ├── adoptions/        # Service adoptions
│   ├── awareness/        # Service sensibilisation
│   ├── reservations/     # Service réservations
│   ├── stocks/           # Service gestion stocks
│   ├── appointments/     # Service rendez-vous
│   ├── messages/         # Service messages
│   └── auth/             # Service authentification
├── docker-compose.yml
└── README.md
```

## 🚀 Installation

### Prérequis
- Node.js 16+
- Docker & Docker Compose
- MySQL 8+

### Lancer le projet

1. Cloner le projet
```bash
cd amouche
```

2. Lancer avec Docker
```bash
docker-compose up -d
```

3. Frontend: http://localhost:3000
4. Services API:
   - Animals: http://localhost:3001
   - Veterinary: http://localhost:3002
   - Adoptions: http://localhost:3003
   - Awareness: http://localhost:3004
   - Reservations: http://localhost:3005
   - Stocks: http://localhost:3006
   - Appointments: http://localhost:3007
   - Messages: http://localhost:3008
   - Auth: http://localhost:3009

## 📦 Installation manuelle

### Frontend
```bash
cd frontend
npm install
npm start
```

### Services
```bash
cd services/animals
npm install
npm start
```

## 🗄️ Base de données

La base de données MySQL sera créée automatiquement avec Docker Compose.

**Configuration par défaut:**
- Host: localhost
- Port: 3306
- User: root
- Password: root123
- Database: amouch_db

