import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Awareness.css';

const API_URL = process.env.REACT_APP_AWARENESS_API || 'http://localhost:3004';

function Awareness() {
  const { user, isAdopter } = useAuth();
  const [campaigns, setCampaigns] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedCampaigns, setLikedCampaigns] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'adoption',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'draft',
    target_audience: '',
    content: '',
    tags: '',
    location: '',
    featured: false
  });
  const [currentCampaign, setCurrentCampaign] = useState(null);

  useEffect(() => {
    fetchCampaigns();
    fetchActiveCampaigns();
    fetchStats();
    if (user?.email) {
      checkLikedCampaigns();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/campaigns`);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchActiveCampaigns = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/campaigns/active`);
      setActiveCampaigns(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/campaigns/stats/overview`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const checkLikedCampaigns = async () => {
    if (!user?.email) return;
    const likedSet = new Set();
    for (const campaign of campaigns) {
      try {
        const response = await axios.get(`${API_URL}/api/campaigns/${campaign.id}/liked`, {
          params: { user_email: user.email }
        });
        if (response.data.liked) {
          likedSet.add(campaign.id);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
    setLikedCampaigns(likedSet);
  };

  const handleLike = async (campaignId) => {
    if (!user?.email) {
      alert('Veuillez vous connecter pour liker une campagne');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/api/campaigns/${campaignId}/like`, {
        user_email: user.email
      });
      const newLikedSet = new Set(likedCampaigns);
      if (response.data.liked) {
        newLikedSet.add(campaignId);
      } else {
        newLikedSet.delete(campaignId);
      }
      setLikedCampaigns(newLikedSet);
      fetchCampaigns();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleShare = async (campaignId) => {
    if (navigator.share) {
      const campaign = campaigns.find(c => c.id === campaignId);
      try {
        await navigator.share({
          title: campaign.title,
          text: campaign.description,
          url: window.location.href
        });
        await axios.post(`${API_URL}/api/campaigns/${campaignId}/share`, {
          user_email: user?.email
        });
        fetchCampaigns();
      } catch (error) {
        console.error('Erreur:', error);
      }
    } else {
      // Fallback: copier dans le presse-papier
      const campaign = campaigns.find(c => c.id === campaignId);
      const text = `${campaign.title}\n${campaign.description}\n${window.location.href}`;
      navigator.clipboard.writeText(text);
      alert('Lien copié dans le presse-papier!');
      await axios.post(`${API_URL}/api/campaigns/${campaignId}/share`, {
        user_email: user?.email
      });
      fetchCampaigns();
    }
  };

  const openCampaign = async (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
    // Enregistrer la vue
    await axios.post(`${API_URL}/api/campaigns/${campaign.id}/view`, {
      user_email: user?.email
    });
    // Charger les commentaires
    try {
      const response = await axios.get(`${API_URL}/api/campaigns/${campaign.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
    fetchCampaigns();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCampaign(null);
    setComments([]);
    setNewComment('');
  };

  const openFormModal = (campaign = null) => {
    if (campaign) {
      setCurrentCampaign(campaign);
      setFormData({
        title: campaign.title || '',
        description: campaign.description || '',
        category: campaign.category || 'adoption',
        start_date: campaign.start_date || new Date().toISOString().split('T')[0],
        end_date: campaign.end_date || '',
        status: campaign.status || 'draft',
        target_audience: campaign.target_audience || '',
        content: campaign.content || '',
        tags: campaign.tags || '',
        location: campaign.location || '',
        featured: campaign.featured || false
      });
    } else {
      setCurrentCampaign(null);
      setFormData({
        title: '',
        description: '',
        category: 'adoption',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        status: 'draft',
        target_audience: '',
        content: '',
        tags: '',
        location: '',
        featured: false
      });
    }
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        created_by: user?.name || user?.email
      };
      if (currentCampaign) {
        await axios.put(`${API_URL}/api/campaigns/${currentCampaign.id}`, data);
      } else {
        await axios.post(`${API_URL}/api/campaigns`, data);
      }
      fetchCampaigns();
      fetchActiveCampaigns();
      fetchStats();
      closeFormModal();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette campagne ?')) {
      try {
        await axios.delete(`${API_URL}/api/campaigns/${id}`);
        fetchCampaigns();
        fetchActiveCampaigns();
        fetchStats();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setCurrentCampaign(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_URL}/api/campaigns/${selectedCampaign.id}/comments`, {
        user_name: user.name,
        user_email: user.email,
        comment: newComment
      });
      setNewComment('');
      const response = await axios.get(`${API_URL}/api/campaigns/${selectedCampaign.id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      health: 'Santé',
      adoption: 'Adoption',
      education: 'Éducation',
      prevention: 'Prévention',
      welfare: 'Bien-être'
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      health: '🏥',
      adoption: '🏠',
      education: '📚',
      prevention: '🛡️',
      welfare: '❤️'
    };
    return icons[category] || '📢';
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-secondary',
      active: 'badge-success',
      completed: 'badge-info',
      cancelled: 'badge-danger'
    };
    const labels = {
      draft: 'Brouillon',
      active: 'Active',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesCategory = selectedCategory === 'all' || campaign.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (campaign.tags && campaign.tags.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="awareness-page">
      <div className="page-header">
        <h1>📢 Sensibilisation & Éducation</h1>
        <p>Ressources complètes pour la sensibilisation et l'éducation sur les animaux au Maroc 🇲🇦</p>
        <div className="header-badges">
          <span className="badge-header">📚 Guides Éducatifs</span>
          <span className="badge-header">🎯 Campagnes de Sensibilisation</span>
          <span className="badge-header">💡 Conseils Pratiques</span>
        </div>
        {user && !isAdopter && (
          <button className="btn btn-primary" onClick={() => openFormModal()}>
            + Créer une campagne
          </button>
        )}
      </div>

      {/* Statistiques */}
      {stats && user && !isAdopter && (
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.overview?.total_campaigns || 0}</h3>
              <p>Total Campagnes</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.overview?.active || 0}</h3>
              <p>Actives</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-info">
              <h3>{stats.overview?.total_views || 0}</h3>
              <p>Vues Total</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{stats.overview?.total_likes || 0}</h3>
              <p>Likes Total</p>
            </div>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 Rechercher une campagne..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Guides éducatifs et sensibilisation */}
      <div className="guides-section">
        <h2>📚 Guides Éducatifs & Ressources</h2>
        <div className="guides-grid">
          {campaigns.filter(c => c.category === 'education').slice(0, 6).map(campaign => (
            <div key={campaign.id} className="guide-card">
              <div className="guide-icon">📖</div>
              <h3>{campaign.title}</h3>
              <p className="guide-description">{campaign.description}</p>
              <div className="guide-stats">
                <span>👁️ {campaign.views_count || 0}</span>
                <span>❤️ {campaign.likes_count || 0}</span>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => openCampaign(campaign)}
              >
                Lire le guide complet →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Sensibilisation santé */}
      <div className="health-awareness-section">
        <h2>🏥 Sensibilisation Santé & Bien-être</h2>
        <div className="health-grid">
          {campaigns.filter(c => c.category === 'health' || c.category === 'welfare').slice(0, 4).map(campaign => (
            <div key={campaign.id} className="health-card">
              <div className="health-badge">{getCategoryIcon(campaign.category)}</div>
              <h3>{campaign.title}</h3>
              <p>{campaign.description}</p>
              {campaign.tags && (
                <div className="tags-small">
                  {campaign.tags.split(',').slice(0, 2).map((tag, idx) => (
                    <span key={idx}>#{tag.trim()}</span>
                  ))}
                </div>
              )}
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => openCampaign(campaign)}
              >
                En savoir plus
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campagnes actives en vedette */}
      {activeCampaigns.filter(c => c.featured).length > 0 && (
        <div className="featured-section">
          <h2>🌟 Campagnes Mises en Vedette</h2>
          <div className="featured-campaigns">
            {activeCampaigns.filter(c => c.featured).map(campaign => (
              <div key={campaign.id} className="featured-card">
                <div className="featured-icon">
                  {getCategoryIcon(campaign.category)}
                </div>
                <h3>{campaign.title}</h3>
                <p className="category-label">{getCategoryLabel(campaign.category)}</p>
                <p className="description">{campaign.description}</p>
                <div className="campaign-stats">
                  <span>👁️ {campaign.views_count || 0}</span>
                  <span>❤️ {campaign.likes_count || 0}</span>
                  <span>📤 {campaign.shares_count || 0}</span>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => openCampaign(campaign)}
                >
                  En savoir plus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres par catégorie */}
      <div className="category-filters">
        <button 
          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Toutes
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'health' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('health')}
        >
          🏥 Santé
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'adoption' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('adoption')}
        >
          🏠 Adoption
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'education' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('education')}
        >
          📚 Éducation
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'prevention' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('prevention')}
        >
          🛡️ Prévention
        </button>
        <button 
          className={`filter-btn ${selectedCategory === 'welfare' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('welfare')}
        >
          ❤️ Bien-être
        </button>
      </div>

      {/* Toutes les campagnes */}
      <div className="campaigns-grid">
        {filteredCampaigns.map(campaign => (
          <div key={campaign.id} className="campaign-card">
            {campaign.featured && <span className="featured-badge">⭐ Vedette</span>}
            <div className="campaign-header">
              <div className="campaign-icon">
                {getCategoryIcon(campaign.category)}
              </div>
              <div className="campaign-status">
                {getStatusBadge(campaign.status)}
              </div>
            </div>
            <h3>{campaign.title}</h3>
            <p className="category">{getCategoryLabel(campaign.category)}</p>
            <p className="description">{campaign.description}</p>
            {campaign.tags && (
              <div className="tags">
                {campaign.tags.split(',').slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="tag">#{tag.trim()}</span>
                ))}
              </div>
            )}
            <div className="campaign-stats-small">
              <span>👁️ {campaign.views_count || 0}</span>
              <span>❤️ {campaign.likes_count || 0}</span>
              <span>📤 {campaign.shares_count || 0}</span>
            </div>
            <div className="campaign-footer">
              <p className="dates">
                📅 Du {new Date(campaign.start_date).toLocaleDateString('fr-FR')}
                {campaign.end_date && ` au ${new Date(campaign.end_date).toLocaleDateString('fr-FR')}`}
              </p>
              <div className="campaign-actions">
                <button 
                  className={`btn-like ${likedCampaigns.has(campaign.id) ? 'liked' : ''}`}
                  onClick={() => handleLike(campaign.id)}
                  title={likedCampaigns.has(campaign.id) ? 'Retirer le like' : 'Liker'}
                >
                  ❤️ {campaign.likes_count || 0}
                </button>
                <button 
                  className="btn-share"
                  onClick={() => handleShare(campaign.id)}
                  title="Partager"
                >
                  📤
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => openCampaign(campaign)}
                >
                  Voir détails
                </button>
                {user && !isAdopter && (
                  <>
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => openFormModal(campaign)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(campaign.id)}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <div className="empty-state">
          <p>🔍 Aucune campagne trouvée</p>
        </div>
      )}

      {/* Section prévention */}
      {campaigns.filter(c => c.category === 'prevention' || c.category === 'adoption').length > 0 && (
        <div className="prevention-section">
          <h2>🛡️ Prévention & Adoption Responsable</h2>
          <div className="prevention-grid">
            {campaigns.filter(c => c.category === 'prevention' || c.category === 'adoption').slice(0, 3).map(campaign => (
              <div key={campaign.id} className="prevention-card">
                <div className="prevention-icon">{getCategoryIcon(campaign.category)}</div>
                <h3>{campaign.title}</h3>
                <p>{campaign.description}</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => openCampaign(campaign)}
                >
                  Lire la suite →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showModal && selectedCampaign && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="campaign-icon-large">{getCategoryIcon(selectedCampaign.category)}</span>
                <h2>{selectedCampaign.title}</h2>
              </div>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="campaign-meta">
                <div className="meta-item">
                  <strong>Catégorie:</strong> {getCategoryLabel(selectedCampaign.category)}
                </div>
                <div className="meta-item">
                  <strong>Statut:</strong> {getStatusBadge(selectedCampaign.status)}
                </div>
                <div className="meta-item">
                  <strong>Période:</strong> Du {new Date(selectedCampaign.start_date).toLocaleDateString('fr-FR')}
                  {selectedCampaign.end_date && ` au ${new Date(selectedCampaign.end_date).toLocaleDateString('fr-FR')}`}
                </div>
                {selectedCampaign.target_audience && (
                  <div className="meta-item">
                    <strong>Public cible:</strong> {selectedCampaign.target_audience}
                  </div>
                )}
                {selectedCampaign.location && (
                  <div className="meta-item">
                    <strong>📍 Localisation:</strong> {selectedCampaign.location}
                  </div>
                )}
              </div>

              <div className="campaign-stats-full">
                <span>👁️ <strong>{selectedCampaign.views_count || 0}</strong> vues</span>
                <span>❤️ <strong>{selectedCampaign.likes_count || 0}</strong> likes</span>
                <span>📤 <strong>{selectedCampaign.shares_count || 0}</strong> partages</span>
              </div>
              
              <div className="campaign-description">
                <h3>Description</h3>
                <p>{selectedCampaign.description}</p>
              </div>

              {selectedCampaign.content && (
                <div className="campaign-content">
                  <h3>📖 Contenu Détaillé</h3>
                  <div className="content-text">
                    {selectedCampaign.content.split('\n').map((line, idx) => {
                      // Détecter les listes et les titres
                      if (line.trim().startsWith('- ') || line.trim().startsWith('✅') || line.trim().startsWith('❌') || line.trim().startsWith('⚠️') || line.trim().startsWith('🚨') || line.trim().startsWith('💡') || line.trim().startsWith('🔴') || line.trim().startsWith('🟢')) {
                        return <div key={idx} style={{ marginBottom: '0.5rem', paddingLeft: '1rem' }}>{line}</div>;
                      }
                      if (line.trim().startsWith('📚') || line.trim().startsWith('🐕') || line.trim().startsWith('🐱') || line.trim().startsWith('👴') || line.trim().startsWith('👶')) {
                        return <h4 key={idx} style={{ color: '#667eea', marginTop: '1.5rem', marginBottom: '0.8rem', fontSize: '1.2rem' }}>{line}</h4>;
                      }
                      if (line.trim().match(/^\d+\./)) {
                        return <div key={idx} style={{ marginBottom: '0.8rem', paddingLeft: '1rem', fontWeight: 'bold', color: '#667eea' }}>{line}</div>;
                      }
                      if (line.trim() === '') {
                        return <br key={idx} />;
                      }
                      return <p key={idx} style={{ marginBottom: '0.8rem' }}>{line}</p>;
                    })}
                  </div>
                </div>
              )}

              {selectedCampaign.tags && (
                <div className="campaign-tags">
                  <h3>Tags</h3>
                  <div className="tags">
                    {selectedCampaign.tags.split(',').map((tag, idx) => (
                      <span key={idx} className="tag">#{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Commentaires */}
              <div className="comments-section">
                <h3>💬 Commentaires ({comments.length})</h3>
                <div className="comments-list">
                  {comments.map(comment => (
                    <div key={comment.id} className="comment">
                      <div className="comment-header">
                        <strong>{comment.user_name}</strong>
                        <span className="comment-date">
                          {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p>{comment.comment}</p>
                    </div>
                  ))}
                </div>
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="comment-form">
                    <input
                      type="text"
                      placeholder="Ajouter un commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="comment-input"
                    />
                    <button type="submit" className="btn btn-primary">Envoyer</button>
                  </form>
                ) : (
                  <div className="comment-login-prompt">
                    <p>🔐 <a href="/login">Connectez-vous</a> pour ajouter un commentaire</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de création/modification */}
      {showFormModal && user && !isAdopter && (
        <div className="modal-overlay" onClick={closeFormModal}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentCampaign ? 'Modifier' : 'Créer'} une campagne</h2>
              <button className="modal-close" onClick={closeFormModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Titre*</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description*</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie*</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="adoption">🏠 Adoption</option>
                    <option value="health">🏥 Santé</option>
                    <option value="education">📚 Éducation</option>
                    <option value="prevention">🛡️ Prévention</option>
                    <option value="welfare">❤️ Bien-être</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Statut*</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    required
                  >
                    <option value="draft">Brouillon</option>
                    <option value="active">Active</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de début*</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date de fin</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Public cible</label>
                <input
                  type="text"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                  placeholder="Ex: Familles, Enfants, Propriétaires de chiens..."
                />
              </div>
              <div className="form-group">
                <label>Localisation</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Ex: Casablanca, Maroc..."
                />
              </div>
              <div className="form-group">
                <label>Tags (séparés par des virgules)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="Ex: adoption, chien, maroc..."
                />
              </div>
              <div className="form-group">
                <label>Contenu détaillé</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="6"
                  placeholder="Contenu complet de la campagne..."
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                  Mettre en vedette
                </label>
              </div>
              <button type="submit" className="btn btn-primary">
                {currentCampaign ? 'Modifier' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Awareness;
