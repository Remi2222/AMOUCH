const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

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

// GET - Toutes les adoptions
app.get('/api/adoptions', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ad.*, a.name as animal_name, a.species, a.breed, a.image_url as animal_image
      FROM adoptions ad
      LEFT JOIN animals a ON ad.animal_id = a.id
      ORDER BY ad.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des adoptions' });
  }
});

// GET - Une adoption par ID
app.get('/api/adoptions/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ad.*, a.name as animal_name, a.species, a.breed
      FROM adoptions ad
      LEFT JOIN animals a ON ad.animal_id = a.id
      WHERE ad.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Adoption non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'adoption' });
  }
});

// GET - Adoptions en attente
app.get('/api/adoptions/status/pending', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT ad.*, a.name as animal_name, a.species, a.breed
      FROM adoptions ad
      LEFT JOIN animals a ON ad.animal_id = a.id
      WHERE ad.status = 'pending'
      ORDER BY ad.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des adoptions en attente' });
  }
});

// GET - Animaux adoptables
app.get('/api/adoptions/animals/available', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM animals 
      WHERE adoption_status = 'adoptable' 
      AND status = 'available'
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des animaux adoptables' });
  }
});

// POST - Créer une demande d'adoption
app.post('/api/adoptions', async (req, res) => {
  const { 
    animal_id, 
    adopter_name, 
    adopter_email, 
    adopter_phone, 
    adopter_address,
    adoption_date, 
    home_visit_required,
    home_visit_date,
    adoption_fee,
    notes 
  } = req.body;
  
  if (!animal_id || !adopter_name || !adopter_email || !adoption_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    // Vérifier que l'animal est adoptable
    const [animals] = await pool.query(
      'SELECT adoption_status FROM animals WHERE id = ?', 
      [animal_id]
    );
    
    if (animals.length === 0) {
      return res.status(404).json({ error: 'Animal non trouvé' });
    }
    
    if (animals[0].adoption_status !== 'adoptable') {
      return res.status(400).json({ error: 'Cet animal n\'est pas disponible pour adoption' });
    }

    const [result] = await pool.query(
      `INSERT INTO adoptions 
      (animal_id, adopter_name, adopter_email, adopter_phone, adopter_address, adoption_date, home_visit_required, home_visit_date, adoption_fee, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [animal_id, adopter_name, adopter_email, adopter_phone, adopter_address, adoption_date, home_visit_required !== false, home_visit_date, adoption_fee || 0, notes]
    );
    
    // Mettre à jour le statut d'adoption de l'animal
    await pool.query(
      'UPDATE animals SET adoption_status = ? WHERE id = ?', 
      ['pending', animal_id]
    );
    
    const [newAdoption] = await pool.query('SELECT * FROM adoptions WHERE id = ?', [result.insertId]);
    res.status(201).json(newAdoption[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la demande d\'adoption' });
  }
});

// PUT - Mettre à jour une adoption
app.put('/api/adoptions/:id', async (req, res) => {
  const { 
    status, 
    home_visit_date, 
    contract_signed, 
    notes 
  } = req.body;
  
  try {
    // Si le statut change, mettre à jour l'animal
    if (status) {
      const [adoption] = await pool.query('SELECT animal_id FROM adoptions WHERE id = ?', [req.params.id]);
      
      if (adoption.length > 0) {
        const animalId = adoption[0].animal_id;
        
        if (status === 'approved' || status === 'completed') {
          await pool.query(
            'UPDATE animals SET adoption_status = ?, status = ? WHERE id = ?', 
            ['adopted', 'adopted', animalId]
          );
        } else if (status === 'rejected' || status === 'cancelled') {
          await pool.query(
            'UPDATE animals SET adoption_status = ?, status = ? WHERE id = ?', 
            ['adoptable', 'available', animalId]
          );
        }
      }
    }

    const updates = [];
    const values = [];
    
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (home_visit_date !== undefined) { updates.push('home_visit_date = ?'); values.push(home_visit_date); }
    if (contract_signed !== undefined) { updates.push('contract_signed = ?'); values.push(contract_signed); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE adoptions SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Adoption non trouvée' });
    }

    const [updated] = await pool.query('SELECT * FROM adoptions WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'adoption' });
  }
});

// DELETE - Supprimer une demande d'adoption
app.delete('/api/adoptions/:id', async (req, res) => {
  try {
    // Récupérer l'animal_id avant suppression
    const [adoption] = await pool.query('SELECT animal_id FROM adoptions WHERE id = ?', [req.params.id]);
    
    const [result] = await pool.query('DELETE FROM adoptions WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Adoption non trouvée' });
    }

    // Remettre l'animal comme adoptable
    if (adoption.length > 0) {
      await pool.query(
        'UPDATE animals SET adoption_status = ?, status = ? WHERE id = ?', 
        ['adoptable', 'available', adoption[0].animal_id]
      );
    }

    res.json({ message: 'Demande d\'adoption supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// GET - Statistiques d'adoption
app.get('/api/adoptions/stats/overview', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_adoptions,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM adoptions
    `);
    
    const [animalsStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_animals,
        SUM(CASE WHEN adoption_status = 'adoptable' THEN 1 ELSE 0 END) as adoptable,
        SUM(CASE WHEN adoption_status = 'adopted' THEN 1 ELSE 0 END) as adopted,
        SUM(CASE WHEN adoption_status = 'pending' THEN 1 ELSE 0 END) as pending
      FROM animals
    `);
    
    res.json({
      adoptions: stats[0],
      animals: animalsStats[0]
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'adoptions-service' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🏠 Service Adoptions démarré sur le port ${PORT}`);
  });
});

