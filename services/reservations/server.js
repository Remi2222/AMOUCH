const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

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

// GET - Récupérer toutes les réservations
app.get('/api/reservations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservations ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
  }
});

// GET - Récupérer une réservation par ID
app.get('/api/reservations/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la réservation' });
  }
});

// POST - Créer une nouvelle réservation
app.post('/api/reservations', async (req, res) => {
  const { animal_id, customer_name, customer_email, customer_phone, reservation_date, status, notes } = req.body;
  
  if (!animal_id || !customer_name || !customer_email || !reservation_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    // Vérifier si l'animal existe et est disponible
    const [animals] = await pool.query('SELECT status FROM animals WHERE id = ?', [animal_id]);
    if (animals.length === 0) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }

    const [result] = await pool.query(
      'INSERT INTO reservations (animal_id, customer_name, customer_email, customer_phone, reservation_date, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [animal_id, customer_name, customer_email, customer_phone || null, reservation_date, status || 'pending', notes || null]
    );
    
    // Mettre à jour le statut de l'animal à "reserved"
    await pool.query('UPDATE animals SET status = ? WHERE id = ?', ['reserved', animal_id]);
    
    const [newReservation] = await pool.query('SELECT * FROM reservations WHERE id = ?', [result.insertId]);
    res.status(201).json(newReservation[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
  }
});

// PUT - Mettre à jour une réservation
app.put('/api/reservations/:id', async (req, res) => {
  const { animal_id, customer_name, customer_email, customer_phone, reservation_date, status, notes } = req.body;
  const id = req.params.id;

  try {
    // Si le statut change, mettre à jour l'animal
    if (status) {
      const [reservation] = await pool.query('SELECT animal_id FROM reservations WHERE id = ?', [id]);
      if (reservation.length > 0) {
        const animalId = reservation[0].animal_id;
        if (status === 'cancelled') {
          await pool.query('UPDATE animals SET status = ? WHERE id = ?', ['available', animalId]);
        } else if (status === 'completed') {
          await pool.query('UPDATE animals SET status = ? WHERE id = ?', ['sold', animalId]);
        }
      }
    }

    const updates = [];
    const values = [];
    
    if (animal_id !== undefined) { updates.push('animal_id = ?'); values.push(animal_id); }
    if (customer_name !== undefined) { updates.push('customer_name = ?'); values.push(customer_name); }
    if (customer_email !== undefined) { updates.push('customer_email = ?'); values.push(customer_email); }
    if (customer_phone !== undefined) { updates.push('customer_phone = ?'); values.push(customer_phone); }
    if (reservation_date !== undefined) { updates.push('reservation_date = ?'); values.push(reservation_date); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    values.push(id);

    const [result] = await pool.query(
      `UPDATE reservations SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    const [updatedReservation] = await pool.query('SELECT * FROM reservations WHERE id = ?', [id]);
    res.json(updatedReservation[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la réservation' });
  }
});

// DELETE - Supprimer une réservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    // Récupérer l'animal_id avant de supprimer
    const [reservation] = await pool.query('SELECT animal_id FROM reservations WHERE id = ?', [req.params.id]);
    
    const [result] = await pool.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Remettre l'animal en disponible
    if (reservation.length > 0) {
      await pool.query('UPDATE animals SET status = ? WHERE id = ?', ['available', reservation[0].animal_id]);
    }

    res.json({ message: 'Réservation supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réservation' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'reservations-service' });
});

// Démarrer le serveur
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`📅 Service Réservations démarré sur le port ${PORT}`);
  });
});

