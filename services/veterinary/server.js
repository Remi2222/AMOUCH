const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

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

// ============ DOSSIERS MÉDICAUX ============

app.get('/api/medical-records', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT mr.*, a.name as animal_name, a.species 
      FROM medical_records mr 
      LEFT JOIN animals a ON mr.animal_id = a.id 
      ORDER BY mr.visit_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des dossiers médicaux' });
  }
});

app.get('/api/medical-records/animal/:animalId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM medical_records WHERE animal_id = ? ORDER BY visit_date DESC',
      [req.params.animalId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des dossiers' });
  }
});

app.post('/api/medical-records', async (req, res) => {
  const { animal_id, visit_date, veterinarian_name, diagnosis, treatment, prescriptions, notes, next_visit_date } = req.body;
  
  if (!animal_id || !visit_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO medical_records (animal_id, visit_date, veterinarian_name, diagnosis, treatment, prescriptions, notes, next_visit_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [animal_id, visit_date, veterinarian_name, diagnosis, treatment, prescriptions, notes, next_visit_date]
    );
    
    const [newRecord] = await pool.query('SELECT * FROM medical_records WHERE id = ?', [result.insertId]);
    res.status(201).json(newRecord[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du dossier médical' });
  }
});

app.put('/api/medical-records/:id', async (req, res) => {
  const { visit_date, veterinarian_name, diagnosis, treatment, prescriptions, notes, next_visit_date } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (visit_date !== undefined) { updates.push('visit_date = ?'); values.push(visit_date); }
    if (veterinarian_name !== undefined) { updates.push('veterinarian_name = ?'); values.push(veterinarian_name); }
    if (diagnosis !== undefined) { updates.push('diagnosis = ?'); values.push(diagnosis); }
    if (treatment !== undefined) { updates.push('treatment = ?'); values.push(treatment); }
    if (prescriptions !== undefined) { updates.push('prescriptions = ?'); values.push(prescriptions); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    if (next_visit_date !== undefined) { updates.push('next_visit_date = ?'); values.push(next_visit_date); }
    
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE medical_records SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dossier médical non trouvé' });
    }

    const [updated] = await pool.query('SELECT * FROM medical_records WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.delete('/api/medical-records/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM medical_records WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dossier médical non trouvé' });
    }

    res.json({ message: 'Dossier médical supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ============ VACCINATIONS ============

app.get('/api/vaccinations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, a.name as animal_name, a.species 
      FROM vaccinations v 
      LEFT JOIN animals a ON v.animal_id = a.id 
      ORDER BY v.vaccination_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vaccinations' });
  }
});

app.get('/api/vaccinations/animal/:animalId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vaccinations WHERE animal_id = ? ORDER BY vaccination_date DESC',
      [req.params.animalId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vaccinations' });
  }
});

app.get('/api/vaccinations/due-soon', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, a.name as animal_name, a.species 
      FROM vaccinations v 
      LEFT JOIN animals a ON v.animal_id = a.id 
      WHERE v.next_due_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
      AND v.next_due_date >= CURDATE()
      ORDER BY v.next_due_date ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rappels' });
  }
});

app.post('/api/vaccinations', async (req, res) => {
  const { animal_id, vaccine_name, vaccination_date, next_due_date, veterinarian, notes } = req.body;
  
  if (!animal_id || !vaccine_name || !vaccination_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO vaccinations (animal_id, vaccine_name, vaccination_date, next_due_date, veterinarian, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [animal_id, vaccine_name, vaccination_date, next_due_date, veterinarian, notes]
    );
    
    const [newVaccination] = await pool.query('SELECT * FROM vaccinations WHERE id = ?', [result.insertId]);
    res.status(201).json(newVaccination[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la vaccination' });
  }
});

app.delete('/api/vaccinations/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM vaccinations WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vaccination non trouvée' });
    }

    res.json({ message: 'Vaccination supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ============ MÉDICAMENTS ============

app.get('/api/medications', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medications ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des médicaments' });
  }
});

app.get('/api/medications/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM medications WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Médicament non trouvé' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du médicament' });
  }
});

app.post('/api/medications', async (req, res) => {
  const { name, type, description, dosage_info, side_effects, stock_quantity, unit_price, expiry_date, manufacturer, requires_prescription } = req.body;
  
  if (!name || !type) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO medications (name, type, description, dosage_info, side_effects, stock_quantity, unit_price, expiry_date, manufacturer, requires_prescription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, type, description, dosage_info, side_effects, stock_quantity || 0, unit_price, expiry_date, manufacturer, requires_prescription !== false]
    );
    
    const [newMed] = await pool.query('SELECT * FROM medications WHERE id = ?', [result.insertId]);
    res.status(201).json(newMed[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du médicament' });
  }
});

app.put('/api/medications/:id', async (req, res) => {
  const { name, type, description, dosage_info, side_effects, stock_quantity, unit_price, expiry_date, manufacturer, requires_prescription } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (name !== undefined) { updates.push('name = ?'); values.push(name); }
    if (type !== undefined) { updates.push('type = ?'); values.push(type); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (dosage_info !== undefined) { updates.push('dosage_info = ?'); values.push(dosage_info); }
    if (side_effects !== undefined) { updates.push('side_effects = ?'); values.push(side_effects); }
    if (stock_quantity !== undefined) { updates.push('stock_quantity = ?'); values.push(stock_quantity); }
    if (unit_price !== undefined) { updates.push('unit_price = ?'); values.push(unit_price); }
    if (expiry_date !== undefined) { updates.push('expiry_date = ?'); values.push(expiry_date); }
    if (manufacturer !== undefined) { updates.push('manufacturer = ?'); values.push(manufacturer); }
    if (requires_prescription !== undefined) { updates.push('requires_prescription = ?'); values.push(requires_prescription); }
    
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE medications SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Médicament non trouvé' });
    }

    const [updated] = await pool.query('SELECT * FROM medications WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.delete('/api/medications/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM medications WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Médicament non trouvé' });
    }

    res.json({ message: 'Médicament supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ============ TRAITEMENTS ============

app.get('/api/treatments', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, a.name as animal_name, m.name as medication_name 
      FROM treatments t 
      LEFT JOIN animals a ON t.animal_id = a.id 
      LEFT JOIN medications m ON t.medication_id = m.id 
      ORDER BY t.start_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des traitements' });
  }
});

app.get('/api/treatments/animal/:animalId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT t.*, m.name as medication_name, m.type as medication_type
      FROM treatments t 
      LEFT JOIN medications m ON t.medication_id = m.id 
      WHERE t.animal_id = ? 
      ORDER BY t.start_date DESC
    `, [req.params.animalId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des traitements' });
  }
});

app.post('/api/treatments', async (req, res) => {
  const { animal_id, medication_id, prescribed_by, start_date, end_date, dosage, frequency, status, notes } = req.body;
  
  if (!animal_id || !medication_id || !start_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO treatments (animal_id, medication_id, prescribed_by, start_date, end_date, dosage, frequency, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [animal_id, medication_id, prescribed_by, start_date, end_date, dosage, frequency, status || 'active', notes]
    );
    
    const [newTreatment] = await pool.query('SELECT * FROM treatments WHERE id = ?', [result.insertId]);
    res.status(201).json(newTreatment[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du traitement' });
  }
});

app.put('/api/treatments/:id', async (req, res) => {
  const { end_date, status, notes } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE treatments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Traitement non trouvé' });
    }

    const [updated] = await pool.query('SELECT * FROM treatments WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'veterinary-service' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🏥 Service Vétérinaire démarré sur le port ${PORT}`);
  });
});

