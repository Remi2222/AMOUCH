const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3007;

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

// ============ RENDEZ-VOUS ============

// GET - Tous les rendez-vous (filtrés par rôle si email fourni)
app.get('/api/appointments', async (req, res) => {
  try {
    const { user_email, role } = req.query;
    
    let query = `
      SELECT 
        a.*, 
        u.name as user_name,
        u.email as user_email,
        an.name as animal_name,
        an.species,
        an.breed,
        an.shelter_id,
        v.clinic_name,
        v.id as veterinarian_id,
        vu.name as veterinarian_name,
        vu.email as veterinarian_email
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN animals an ON a.animal_id = an.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
    `;
    
    const conditions = [];
    const values = [];
    
    // Filtrer selon le rôle de l'utilisateur
    if (user_email && role) {
      if (role === 'adopter') {
        // Adoptants: voir uniquement leurs rendez-vous
        conditions.push('u.email = ?');
        values.push(user_email);
      } else if (role === 'veterinarian') {
        // Vétérinaires: voir leurs rendez-vous
        conditions.push('vu.email = ?');
        values.push(user_email);
      } else if (role === 'shelter') {
        // Refuges: voir les rendez-vous des animaux de leur refuge
        conditions.push(`an.shelter_id IN (
          SELECT s.id FROM shelters s
          LEFT JOIN users su ON s.user_id = su.id
          WHERE su.email = ?
        )`);
        values.push(user_email);
      }
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.appointment_date DESC';
    
    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// GET - Rendez-vous par utilisateur
app.get('/api/appointments/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        an.name as animal_name,
        v.clinic_name,
        vu.name as veterinarian_name
      FROM appointments a
      LEFT JOIN animals an ON a.animal_id = an.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      WHERE a.user_id = ?
      ORDER BY a.appointment_date DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// GET - Rendez-vous par vétérinaire
app.get('/api/appointments/veterinarian/:vetId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*, 
        u.name as user_name,
        u.phone as user_phone,
        u.email as user_email,
        an.name as animal_name,
        an.species,
        an.breed
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN animals an ON a.animal_id = an.id
      WHERE a.veterinarian_id = ?
      ORDER BY a.appointment_date ASC
    `, [req.params.vetId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// GET - Rendez-vous à venir (filtrés par rôle)
app.get('/api/appointments/upcoming', async (req, res) => {
  try {
    const { user_email, role } = req.query;
    
    let query = `
      SELECT 
        a.*, 
        u.name as user_name,
        u.email as user_email,
        an.name as animal_name,
        an.species,
        an.breed,
        an.shelter_id,
        v.clinic_name,
        v.id as veterinarian_id,
        vu.name as veterinarian_name,
        vu.email as veterinarian_email
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN animals an ON a.animal_id = an.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      WHERE a.appointment_date >= NOW()
      AND a.status IN ('scheduled', 'confirmed')
    `;
    
    const conditions = [];
    const values = [];
    
    // Filtrer selon le rôle de l'utilisateur
    if (user_email && role) {
      if (role === 'adopter') {
        conditions.push('u.email = ?');
        values.push(user_email);
      } else if (role === 'veterinarian') {
        conditions.push('vu.email = ?');
        values.push(user_email);
      } else if (role === 'shelter') {
        conditions.push(`an.shelter_id IN (
          SELECT s.id FROM shelters s
          LEFT JOIN users su ON s.user_id = su.id
          WHERE su.email = ?
        )`);
        values.push(user_email);
      }
    }
    
    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY a.appointment_date ASC';
    
    const [rows] = await pool.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des rendez-vous' });
  }
});

// POST - Créer un rendez-vous
app.post('/api/appointments', async (req, res) => {
  const { 
    animal_id, 
    user_id, 
    user_email,
    veterinarian_id, 
    appointment_date, 
    appointment_type, 
    reason, 
    notes,
    duration_minutes,
    fee 
  } = req.body;
  
  if ((!user_id && !user_email) || !veterinarian_id || !appointment_date || !appointment_type) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    let userId = user_id;
    
    // Si user_id n'est pas fourni, chercher par email
    if (!userId && user_email) {
      const [userRows] = await pool.query('SELECT id FROM users WHERE email = ?', [user_email]);
      if (userRows.length === 0) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      userId = userRows[0].id;
    }
    
    // Calculer le fee si non fourni (basé sur le vétérinaire)
    let appointmentFee = fee;
    if (!appointmentFee) {
      const [vetRows] = await pool.query(
        'SELECT consultation_fee, teleconsultation_fee FROM veterinarians WHERE id = ?',
        [veterinarian_id]
      );
      if (vetRows.length > 0) {
        appointmentFee = appointment_type === 'teleconsultation' 
          ? vetRows[0].teleconsultation_fee 
          : vetRows[0].consultation_fee;
      }
    }
    
    const [result] = await pool.query(
      `INSERT INTO appointments 
      (animal_id, user_id, veterinarian_id, appointment_date, appointment_type, reason, notes, duration_minutes, fee) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [animal_id, userId, veterinarian_id, appointment_date, appointment_type, reason, notes, duration_minutes || 30, appointmentFee]
    );
    
    const [newAppointment] = await pool.query(`
      SELECT 
        a.*,
        u.name as user_name,
        an.name as animal_name,
        v.clinic_name,
        vu.name as veterinarian_name
      FROM appointments a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN animals an ON a.animal_id = an.id
      LEFT JOIN veterinarians v ON a.veterinarian_id = v.id
      LEFT JOIN users vu ON v.user_id = vu.id
      WHERE a.id = ?
    `, [result.insertId]);
    res.status(201).json(newAppointment[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création du rendez-vous' });
  }
});

// PUT - Mettre à jour un rendez-vous
app.put('/api/appointments/:id', async (req, res) => {
  const { status, notes, video_link, payment_status } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (notes !== undefined) { updates.push('notes = ?'); values.push(notes); }
    if (video_link !== undefined) { updates.push('video_link = ?'); values.push(video_link); }
    if (payment_status !== undefined) { updates.push('payment_status = ?'); values.push(payment_status); }
    
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    const [updated] = await pool.query('SELECT * FROM appointments WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE - Annuler un rendez-vous
app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rendez-vous non trouvé' });
    }

    res.json({ message: 'Rendez-vous supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ============ VÉTÉRINAIRES ============

// GET - Liste des vétérinaires
app.get('/api/veterinarians', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.*,
        u.name,
        u.email,
        u.phone,
        u.profile_image
      FROM veterinarians v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE u.status = 'active'
      ORDER BY v.clinic_name ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des vétérinaires' });
  }
});

// GET - Vétérinaire par ID
app.get('/api/veterinarians/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        v.*,
        u.name,
        u.email,
        u.phone,
        u.profile_image,
        u.address
      FROM veterinarians v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.id = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Vétérinaire non trouvé' });
    }

    // Récupérer les disponibilités
    const [availability] = await pool.query(
      'SELECT * FROM veterinarian_availability WHERE veterinarian_id = ? ORDER BY day_of_week',
      [req.params.id]
    );

    res.json({
      ...rows[0],
      availability
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du vétérinaire' });
  }
});

// GET - Disponibilités d'un vétérinaire
app.get('/api/veterinarians/:id/availability', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM veterinarian_availability WHERE veterinarian_id = ? AND is_available = TRUE ORDER BY day_of_week',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des disponibilités' });
  }
});

// ============ PRESCRIPTIONS ============

// GET - Prescriptions par animal
app.get('/api/prescriptions/animal/:animalId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.*,
        u.name as veterinarian_name,
        v.clinic_name
      FROM prescriptions p
      LEFT JOIN veterinarians v ON p.veterinarian_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE p.animal_id = ?
      ORDER BY p.prescription_date DESC
    `, [req.params.animalId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des prescriptions' });
  }
});

// POST - Créer une prescription
app.post('/api/prescriptions', async (req, res) => {
  const { 
    appointment_id,
    animal_id, 
    veterinarian_id, 
    prescription_date,
    medication_id,
    medication_name, 
    dosage, 
    frequency,
    duration_days,
    instructions,
    refills_allowed
  } = req.body;
  
  if (!animal_id || !veterinarian_id || !medication_name || !prescription_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO prescriptions 
      (appointment_id, animal_id, veterinarian_id, prescription_date, medication_id, medication_name, dosage, frequency, duration_days, instructions, refills_allowed) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [appointment_id, animal_id, veterinarian_id, prescription_date, medication_id, medication_name, dosage, frequency, duration_days, instructions, refills_allowed || 0]
    );
    
    const [newPrescription] = await pool.query('SELECT * FROM prescriptions WHERE id = ?', [result.insertId]);
    res.status(201).json(newPrescription[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la prescription' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'appointments-service' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`📅 Service Rendez-vous démarré sur le port ${PORT}`);
  });
});

