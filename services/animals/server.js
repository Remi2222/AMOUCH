const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'amouch_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Pool de connexions
let pool;

// Initialiser la connexion à la base de données
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connecté à la base de données MySQL');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  }
}

// Routes API

// GET - Récupérer tous les animaux
app.get('/api/animals', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des animaux' });
  }
});

// GET - Récupérer un animal par ID
app.get('/api/animals/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'animal' });
  }
});

// POST - Créer un nouvel animal
app.post('/api/animals', async (req, res) => {
  const { name, species, breed, age_years, age_months, price, description, image_url, status } = req.body;
  
  if (!name || !species) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO animals (name, species, breed, age_years, age_months, price, description, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, species, breed || null, age_years || 0, age_months || 0, price || null, description || null, image_url || null, status || 'available']
    );
    
    const [newAnimal] = await pool.query('SELECT * FROM animals WHERE id = ?', [result.insertId]);
    res.status(201).json(newAnimal[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'animal' });
  }
});

// PUT - Mettre à jour un animal
app.put('/api/animals/:id', async (req, res) => {
  const { name, species, breed, age_years, age_months, price, description, image_url, status } = req.body;
  const id = req.params.id;

  try {
    const [result] = await pool.query(
      'UPDATE animals SET name = ?, species = ?, breed = ?, age_years = ?, age_months = ?, price = ?, description = ?, image_url = ?, status = ? WHERE id = ?',
      [name, species, breed, age_years, age_months, price, description, image_url, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    const [updatedAnimal] = await pool.query('SELECT * FROM animals WHERE id = ?', [id]);
    res.json(updatedAnimal[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'animal' });
  }
});

// DELETE - Supprimer un animal
app.delete('/api/animals/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM animals WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    res.json({ message: 'Animal supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'animal' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'animals-service' });
});

// Démarrer le serveur
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🐾 Service Animaux démarré sur le port ${PORT}`);
  });
});

