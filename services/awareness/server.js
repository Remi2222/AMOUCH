const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3004;

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

// GET - Toutes les campagnes
app.get('/api/campaigns', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM awareness_campaigns ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des campagnes' });
  }
});

// GET - Campagnes actives
app.get('/api/campaigns/active', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM awareness_campaigns WHERE status = ? ORDER BY start_date DESC',
      ['active']
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des campagnes actives' });
  }
});

// GET - Campagnes par catégorie
app.get('/api/campaigns/category/:category', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM awareness_campaigns WHERE category = ? ORDER BY start_date DESC',
      [req.params.category]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des campagnes' });
  }
});

// GET - Une campagne par ID
app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM awareness_campaigns WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la campagne' });
  }
});

// POST - Créer une campagne
app.post('/api/campaigns', async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    start_date, 
    end_date, 
    status, 
    target_audience, 
    content, 
    image_url, 
    created_by 
  } = req.body;
  
  if (!title || !category || !start_date) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO awareness_campaigns 
      (title, description, category, start_date, end_date, status, target_audience, content, image_url, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, category, start_date, end_date, status || 'draft', target_audience, content, image_url, created_by]
    );
    
    const [newCampaign] = await pool.query(
      'SELECT * FROM awareness_campaigns WHERE id = ?', 
      [result.insertId]
    );
    res.status(201).json(newCampaign[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la campagne' });
  }
});

// PUT - Mettre à jour une campagne
app.put('/api/campaigns/:id', async (req, res) => {
  const { 
    title, 
    description, 
    category, 
    start_date, 
    end_date, 
    status, 
    target_audience, 
    content, 
    image_url 
  } = req.body;
  
  try {
    const updates = [];
    const values = [];
    
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (description !== undefined) { updates.push('description = ?'); values.push(description); }
    if (category !== undefined) { updates.push('category = ?'); values.push(category); }
    if (start_date !== undefined) { updates.push('start_date = ?'); values.push(start_date); }
    if (end_date !== undefined) { updates.push('end_date = ?'); values.push(end_date); }
    if (status !== undefined) { updates.push('status = ?'); values.push(status); }
    if (target_audience !== undefined) { updates.push('target_audience = ?'); values.push(target_audience); }
    if (content !== undefined) { updates.push('content = ?'); values.push(content); }
    if (image_url !== undefined) { updates.push('image_url = ?'); values.push(image_url); }
    
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE awareness_campaigns SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }

    const [updated] = await pool.query(
      'SELECT * FROM awareness_campaigns WHERE id = ?', 
      [req.params.id]
    );
    res.json(updated[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la campagne' });
  }
});

// DELETE - Supprimer une campagne
app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM awareness_campaigns WHERE id = ?', 
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }

    res.json({ message: 'Campagne supprimée avec succès' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// POST - Incrémenter les vues
app.post('/api/campaigns/:id/view', async (req, res) => {
  try {
    const { user_email } = req.body;
    const campaignId = req.params.id;
    
    // Vérifier si l'utilisateur a déjà vu cette campagne
    const [existing] = await pool.query(
      'SELECT * FROM campaign_interactions WHERE campaign_id = ? AND user_email = ? AND interaction_type = ?',
      [campaignId, user_email, 'view']
    );
    
    if (existing.length === 0) {
      // Enregistrer la vue
      await pool.query(
        'INSERT INTO campaign_interactions (campaign_id, user_email, interaction_type) VALUES (?, ?, ?)',
        [campaignId, user_email || 'anonymous', 'view']
      );
      
      // Incrémenter le compteur
      await pool.query(
        'UPDATE awareness_campaigns SET views_count = views_count + 1 WHERE id = ?',
        [campaignId]
      );
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de la vue' });
  }
});

// POST - Toggle Like
app.post('/api/campaigns/:id/like', async (req, res) => {
  try {
    const { user_email } = req.body;
    const campaignId = req.params.id;
    
    // Vérifier si l'utilisateur a déjà liké
    const [existing] = await pool.query(
      'SELECT * FROM campaign_interactions WHERE campaign_id = ? AND user_email = ? AND interaction_type = ?',
      [campaignId, user_email, 'like']
    );
    
    if (existing.length === 0) {
      // Ajouter le like
      await pool.query(
        'INSERT INTO campaign_interactions (campaign_id, user_email, interaction_type) VALUES (?, ?, ?)',
        [campaignId, user_email, 'like']
      );
      await pool.query(
        'UPDATE awareness_campaigns SET likes_count = likes_count + 1 WHERE id = ?',
        [campaignId]
      );
      res.json({ liked: true });
    } else {
      // Retirer le like
      await pool.query(
        'DELETE FROM campaign_interactions WHERE campaign_id = ? AND user_email = ? AND interaction_type = ?',
        [campaignId, user_email, 'like']
      );
      await pool.query(
        'UPDATE awareness_campaigns SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = ?',
        [campaignId]
      );
      res.json({ liked: false });
    }
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du like' });
  }
});

// POST - Enregistrer un partage
app.post('/api/campaigns/:id/share', async (req, res) => {
  try {
    const { user_email } = req.body;
    const campaignId = req.params.id;
    
    await pool.query(
      'INSERT INTO campaign_interactions (campaign_id, user_email, interaction_type) VALUES (?, ?, ?)',
      [campaignId, user_email || 'anonymous', 'share']
    );
    
    await pool.query(
      'UPDATE awareness_campaigns SET shares_count = shares_count + 1 WHERE id = ?',
      [campaignId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors du partage' });
  }
});

// GET - Commentaires d'une campagne
app.get('/api/campaigns/:id/comments', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM campaign_comments WHERE campaign_id = ? AND approved = TRUE ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

// POST - Ajouter un commentaire
app.post('/api/campaigns/:id/comments', async (req, res) => {
  try {
    const { user_name, user_email, comment } = req.body;
    const campaignId = req.params.id;
    
    if (!comment || !user_name) {
      return res.status(400).json({ error: 'Champs requis manquants' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO campaign_comments (campaign_id, user_name, user_email, comment) VALUES (?, ?, ?, ?)',
      [campaignId, user_name, user_email || 'anonymous', comment]
    );
    
    const [newComment] = await pool.query(
      'SELECT * FROM campaign_comments WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json(newComment[0]);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
  }
});

// GET - Vérifier si l'utilisateur a liké une campagne
app.get('/api/campaigns/:id/liked', async (req, res) => {
  try {
    const { user_email } = req.query;
    if (!user_email) {
      return res.json({ liked: false });
    }
    
    const [rows] = await pool.query(
      'SELECT * FROM campaign_interactions WHERE campaign_id = ? AND user_email = ? AND interaction_type = ?',
      [req.params.id, user_email, 'like']
    );
    
    res.json({ liked: rows.length > 0 });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la vérification' });
  }
});

// GET - Statistiques avancées
app.get('/api/campaigns/stats/overview', async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_campaigns,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(views_count) as total_views,
        SUM(likes_count) as total_likes,
        SUM(shares_count) as total_shares
      FROM awareness_campaigns
    `);
    
    const [byCategory] = await pool.query(`
      SELECT category, COUNT(*) as count, SUM(views_count) as views, SUM(likes_count) as likes
      FROM awareness_campaigns
      GROUP BY category
    `);
    
    const [topCampaigns] = await pool.query(`
      SELECT id, title, views_count, likes_count, shares_count
      FROM awareness_campaigns
      ORDER BY (views_count + likes_count * 2 + shares_count * 3) DESC
      LIMIT 5
    `);
    
    res.json({
      overview: stats[0],
      by_category: byCategory,
      top_campaigns: topCampaigns
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'awareness-service' });
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`📢 Service Sensibilisation démarré sur le port ${PORT}`);
  });
});

