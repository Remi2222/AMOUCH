const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

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

// GET - Récupérer tous les produits en stock
app.get('/api/stocks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stocks ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des stocks' });
  }
});

// GET - Récupérer un produit par ID
app.get('/api/stocks/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stocks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du produit' });
  }
});

// GET - Récupérer les produits avec stock faible
app.get('/api/stocks/alerts/low', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stocks WHERE quantity <= min_quantity ORDER BY quantity ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des alertes' });
  }
});

// POST - Créer un nouveau produit
app.post('/api/stocks', async (req, res) => {
  const { product_name, category, quantity, unit_price, supplier, min_quantity, description, image_url } = req.body;
  
  if (!product_name || !category || quantity === undefined || !unit_price) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO stocks (product_name, category, quantity, unit_price, supplier, min_quantity, description, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [product_name, category, quantity, unit_price, supplier || null, min_quantity || 10, description || null, image_url || null]
    );
    
    const [newStock] = await pool.query('SELECT * FROM stocks WHERE id = ?', [result.insertId]);
    res.status(201).json(newStock[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

// PUT - Mettre à jour un produit
app.put('/api/stocks/:id', async (req, res) => {
  const { product_name, category, quantity, unit_price, supplier, min_quantity, description, image_url } = req.body;
  const id = req.params.id;

  try {
    const updates = [];
    const values = [];
    
    if (product_name !== undefined) { updates.push('product_name = ?'); values.push(product_name); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (quantity !== undefined) { updates.push('quantity = ?'); values.push(quantity); }
    if (unit_price !== undefined) { updates.push('unit_price = ?'); values.push(unit_price); }
    if (supplier !== undefined) { updates.push('supplier = ?'); values.push(supplier); }
    if (min_quantity !== undefined) { updates.push('min_quantity = ?'); values.push(min_quantity); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
    
    values.push(id);

    const [result] = await pool.query(
      `UPDATE stocks SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    const [updatedStock] = await pool.query('SELECT * FROM stocks WHERE id = ?', [id]);
    res.json(updatedStock[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
});

// DELETE - Supprimer un produit
app.delete('/api/stocks/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM stocks WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'stocks-service' });
});

// Démarrer le serveur
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`📦 Service Stocks démarré sur le port ${PORT}`);
  });
});

