# Guide d'Authentification - AMOUCH

## 🔐 Système d'Authentification

L'application AMOUCH utilise un système d'authentification JWT avec **3 rôles distincts**.

---

## 👥 Les 3 Rôles

### 1. 👤 **Adoptant** (adopter)
**Objectif**: Rechercher et adopter des animaux

**Accès à:**
- ✅ Parcourir les animaux disponibles
- ✅ Soumettre des demandes d'adoption
- ✅ Prendre des rendez-vous vétérinaires
- ✅ Messagerie avec les refuges
- ✅ Sensibilisation

**Dashboard**: `/dashboard/adopter`

---

### 2. 🏠 **Refuge** (shelter)
**Objectif**: Gérer le refuge et les adoptions

**Accès à:**
- ✅ Ajouter/gérer les animaux
- ✅ Traiter les demandes d'adoption
- ✅ Historique complet des animaux
- ✅ Messagerie avec les adoptants
- ✅ Gestion des stocks
- ✅ Créer des campagnes de sensibilisation

**Dashboard**: `/dashboard/shelter`

---

### 3. 👨‍⚕️ **Vétérinaire** (veterinarian)
**Objectif**: Gérer les soins et consultations

**Accès à:**
- ✅ Calendrier des rendez-vous
- ✅ Dossiers médicaux
- ✅ Vaccinations
- ✅ Prescriptions
- ✅ Téléconsultations
- ✅ Messagerie

**Dashboard**: `/dashboard/veterinarian`

---

## 🚀 Utilisation

### Inscription
1. Aller sur `/register`
2. Choisir votre rôle
3. Remplir le formulaire
4. ✅ Redirection automatique vers votre dashboard

### Connexion
1. Aller sur `/login`
2. Entrer email/mot de passe
3. ✅ Redirection vers votre dashboard selon votre rôle

### Déconnexion
- Cliquer sur "Déconnexion" dans la navbar

---

## 🎯 Comptes de Démonstration

Pour tester rapidement l'application:

```
👤 Adoptant:
Email: jean.dupont@email.com
Mot de passe: demo123

🏠 Refuge:
Email: contact@refuge-amis.fr
Mot de passe: demo123

👨‍⚕️ Vétérinaire:
Email: dr.martin@vetclinic.fr
Mot de passe: demo123
```

---

## 🔒 Protection des Routes

### Routes Publiques
- `/` - Accueil
- `/login` - Connexion
- `/register` - Inscription
- `/animals` - Parcourir les animaux
- `/awareness` - Sensibilisation

### Routes Protégées (Authentification requise)
- `/dashboard/*` - Dashboards (selon rôle)
- `/adoptions` - Adoptions
- `/appointments` - Rendez-vous
- `/messages` - Messagerie
- `/veterinary` - Module vétérinaire (refuge/vétérinaire)
- `/stocks` - Stocks (refuge uniquement)

---

## 🛠️ Aspects Techniques

### Token JWT
- Stocké dans `localStorage`
- Durée: 7 jours
- Inclus dans tous les appels API

### Middleware Backend
```javascript
Authorization: Bearer <token>
```

### Contexte React
- `useAuth()` - Hook d'authentification
- `isAuthenticated` - Statut de connexion
- `user` - Infos utilisateur
- `login()`, `register()`, `logout()`

### Protection des Composants
```javascript
<PrivateRoute allowedRoles={['adopter', 'shelter']}>
  <Component />
</PrivateRoute>
```

---

## 📱 Interface Adaptative

La navbar s'adapte selon le rôle:

**Non connecté:**
- Accueil, Animaux, Sensibilisation
- Boutons: Connexion / Inscription

**Adoptant:**
- Dashboard, Animaux, Adoptions, Messages, Sensibilisation

**Refuge:**
- Dashboard, Animaux, Adoptions, Stocks, Messages, Sensibilisation

**Vétérinaire:**
- Dashboard, Rendez-vous, Médical, Messages, Sensibilisation

---

## 🔧 Configuration

### Variables d'environnement Frontend
Créer `.env` dans `frontend/`:
```env
REACT_APP_AUTH_API=http://localhost:3009
REACT_APP_ANIMALS_API=http://localhost:3001
...
```

### Service Auth (Port 3009)
```env
PORT=3009
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=amouch_db
JWT_SECRET=amouch_secret_key_2025
```

---

## 📊 Tables de Base de Données

### Table `users`
```sql
- id, name, email, password (hashé)
- phone, role, address
- profile_image, status
- created_at, updated_at
```

### Table `shelters`
```sql
- user_id (FK)
- shelter_name, license_number
- location, address, city
- capacity, opening_hours
```

### Table `veterinarians`
```sql
- user_id (FK)
- license_number, specialization
- clinic_name, consultation_fee
- teleconsultation_available
- years_experience, bio
```

---

## 🚨 Gestion des Erreurs

### Erreurs communes
- **401 Unauthorized**: Token manquant/invalide → Redirection `/login`
- **403 Forbidden**: Rôle non autorisé → Redirection `/unauthorized`
- **Email déjà utilisé**: Message d'erreur lors de l'inscription

---

## 🔄 Workflow Typique

### Adoptant
1. Inscription → Dashboard adoptant
2. Parcourir les animaux
3. Demande d'adoption
4. Messagerie avec le refuge
5. Prendre RDV vétérinaire après adoption

### Refuge
1. Inscription → Dashboard refuge
2. Ajouter des animaux
3. Recevoir demandes d'adoption
4. Communiquer avec adoptants
5. Approuver adoptions

### Vétérinaire
1. Inscription → Dashboard vétérinaire
2. Configurer disponibilités
3. Recevoir demandes de RDV
4. Créer dossiers médicaux
5. Émettre prescriptions

---

## 📈 Prochaines Fonctionnalités Auth

- [ ] Réinitialisation mot de passe par email
- [ ] OAuth (Google, Facebook)
- [ ] 2FA (authentification à deux facteurs)
- [ ] Gestion des sessions actives
- [ ] Logs d'activité utilisateur
- [ ] Rôle Admin avec permissions avancées

---

## 💡 Bonnes Pratiques

✅ Toujours déconnecter après utilisation sur ordinateur partagé
✅ Choisir un mot de passe fort (min. 6 caractères)
✅ Ne pas partager vos identifiants
✅ Vérifier l'URL avant de saisir vos identifiants
✅ Signaler toute activité suspecte


