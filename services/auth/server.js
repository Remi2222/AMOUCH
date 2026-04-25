const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3009;
const JWT_SECRET = process.env.JWT_SECRET || 'amouch_secret_key_2025';

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amouch_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connecté à la base de données MySQL');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

// Middleware pour vérifier le token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requis' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide' });
    }
    req.user = user;
    next();
  });
};

// ============ AUTHENTIFICATION ============

// POST - Inscription
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone, role, address } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  if (!['adopter', 'shelter', 'veterinarian'].includes(role)) {
    return res.status(400).json({ error: 'Rôle invalide' });
  }

  try {
    // Vérifier si l'email existe déjà
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role, address, 'active']
    );

    const userId = result.insertId;

    // Créer le profil spécifique selon le rôle
    if (role === 'shelter') {
      await pool.query(
        'INSERT INTO shelters (user_id, shelter_name, email, phone) VALUES (?, ?, ?, ?)',
        [userId, name, email, phone]
      );
    } else if (role === 'veterinarian') {
      await pool.query(
        'INSERT INTO veterinarians (user_id, license_number) VALUES (?, ?)',
        [userId, `VET-${Date.now()}`]
      );
    }

    // Générer le token
    const token = jwt.sign(
      { id: userId, email, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: {
        id: userId,
        name,
        email,
        role
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// POST - Connexion
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis' });
  }

  try {
    // Trouver l'utilisateur
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND status = ?',
      [email, 'active']
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = users[0];

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Récupérer les infos du profil selon le rôle
    let profileData = {};
    if (user.role === 'shelter') {
      const [shelter] = await pool.query('SELECT * FROM shelters WHERE user_id = ?', [user.id]);
      if (shelter.length > 0) {
        profileData = { shelter_id: shelter[0].id, shelter_name: shelter[0].shelter_name };
      }
    } else if (user.role === 'veterinarian') {
      const [vet] = await pool.query('SELECT * FROM veterinarians WHERE user_id = ?', [user.id]);
      if (vet.length > 0) {
        profileData = { veterinarian_id: vet[0].id, clinic_name: vet[0].clinic_name };
      }
    }

    // Générer le token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profile_image: user.profile_image,
        ...profileData
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// GET - Profil utilisateur
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, address, profile_image, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const user = users[0];

    // Récupérer les infos du profil selon le rôle
    if (user.role === 'shelter') {
      const [shelter] = await pool.query('SELECT * FROM shelters WHERE user_id = ?', [user.id]);
      if (shelter.length > 0) {
        user.shelter = shelter[0];
      }
    } else if (user.role === 'veterinarian') {
      const [vet] = await pool.query('SELECT * FROM veterinarians WHERE user_id = ?', [user.id]);
      if (vet.length > 0) {
        user.veterinarian = vet[0];
      }
    }

    res.json(user);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// PUT - Mettre à jour le profil
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
  const { name, phone, address, profile_image } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (profile_image !== undefined) { updates.push('profile_image = ?'); values.push(profile_image); }
    
    values.push(req.user.id);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Profil mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// PUT - Changer le mot de passe
app.put('/api/auth/change-password', authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Ancien et nouveau mot de passe requis' });
  }

  try {
    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const validPassword = await bcrypt.compare(oldPassword, users[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Ancien mot de passe incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' });
  }
});

// ============ GESTION UTILISATEURS (ADMIN) ============

// GET - Tous les utilisateurs
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// GET - Utilisateurs par rôle
app.get('/api/users/role/:role', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, status, created_at FROM users WHERE role = ? ORDER BY created_at DESC',
      [req.params.role]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'auth-service' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🔐 Service Authentification démarré sur le port ${PORT}`);
  });
});

