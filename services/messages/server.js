const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3008;

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

// ============ MESSAGES ============

// GET - Messages d'un utilisateur
app.get('/api/messages/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.role as sender_role,
        receiver.name as receiver_name,
        receiver.role as receiver_role,
        a.name as animal_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      LEFT JOIN animals a ON m.animal_id = a.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [req.params.userId, req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
  }
});

// GET - Conversation entre deux utilisateurs
app.get('/api/messages/conversation/:userId1/:userId2', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.role as sender_role,
        a.name as animal_name
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN animals a ON m.animal_id = a.id
      WHERE (m.sender_id = ? AND m.receiver_id = ?)
         OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [req.params.userId1, req.params.userId2, req.params.userId2, req.params.userId1]);
    
    // Marquer les messages reçus comme lus
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE receiver_id = ? AND sender_id = ?',
      [req.params.userId1, req.params.userId2]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la conversation' });
  }
});

// GET - Conversations actives d'un utilisateur
app.get('/api/messages/conversations/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id
          ELSE m.sender_id
        END as contact_id,
        CASE 
          WHEN m.sender_id = ? THEN receiver.name
          ELSE sender.name
        END as contact_name,
        CASE 
          WHEN m.sender_id = ? THEN receiver.role
          ELSE sender.role
        END as contact_role,
        (SELECT message FROM messages 
         WHERE (sender_id = ? AND receiver_id = contact_id) 
            OR (sender_id = contact_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM messages 
         WHERE (sender_id = ? AND receiver_id = contact_id) 
            OR (sender_id = contact_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message_date,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = contact_id AND receiver_id = ? AND is_read = FALSE) as unread_count
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      LEFT JOIN users receiver ON m.receiver_id = receiver.id
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY last_message_date DESC
    `, [
      req.params.userId, req.params.userId, req.params.userId,
      req.params.userId, req.params.userId,
      req.params.userId, req.params.userId,
      req.params.userId,
      req.params.userId, req.params.userId
    ]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des conversations' });
  }
});

// GET - Messages non lus
app.get('/api/messages/unread/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        m.*,
        sender.name as sender_name,
        sender.role as sender_role
      FROM messages m
      LEFT JOIN users sender ON m.sender_id = sender.id
      WHERE m.receiver_id = ? AND m.is_read = FALSE
      ORDER BY m.created_at DESC
    `, [req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des messages non lus' });
  }
});

// POST - Envoyer un message
app.post('/api/messages', async (req, res) => {
  const { sender_id, receiver_id, conversation_id, animal_id, subject, message, message_type, attachment_url } = req.body;
  
  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const convId = conversation_id || `conv_${Math.min(sender_id, receiver_id)}_${Math.max(sender_id, receiver_id)}`;
    
    const [result] = await pool.query(
      `INSERT INTO messages 
      (sender_id, receiver_id, conversation_id, animal_id, subject, message, message_type, attachment_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sender_id, receiver_id, convId, animal_id, subject, message, message_type || 'text', attachment_url]
    );
    
    const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    res.status(201).json(newMessage[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
  }
});

// PUT - Marquer un message comme lu
app.put('/api/messages/:id/read', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ message: 'Message marqué comme lu' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// PUT - Marquer tous les messages d'une conversation comme lus
app.put('/api/messages/conversation/:userId1/:userId2/read', async (req, res) => {
  try {
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE sender_id = ? AND receiver_id = ?',
      [req.params.userId2, req.params.userId1]
    );

    res.json({ message: 'Messages marqués comme lus' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE - Supprimer un message
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ message: 'Message supprimé avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// ============ HISTORIQUE ANIMAUX ============

// GET - Historique d'un animal
app.get('/api/animal-history/:animalId', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ah.*,
        u.name as performed_by_name,
        u.role as performed_by_role
      FROM animal_history ah
      LEFT JOIN users u ON ah.performed_by = u.id
      WHERE ah.animal_id = ?
      ORDER BY ah.event_date DESC
    `, [req.params.animalId]);
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'historique' });
  }
});

// POST - Ajouter un événement à l'historique
app.post('/api/animal-history', async (req, res) => {
  const { animal_id, event_type, event_date, description, performed_by, notes } = req.body;
  
  if (!animal_id || !event_type || !event_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO animal_history 
      (animal_id, event_type, event_date, description, performed_by, notes) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [animal_id, event_type, event_date, description, performed_by, notes]
    );
    
    const [newEvent] = await pool.query('SELECT * FROM animal_history WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout à l\'historique' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'messages-service' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`💬 Service Messages démarré sur le port ${PORT}`);
  });
});

