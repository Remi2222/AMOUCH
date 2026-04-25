import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function ShelterDashboard() {
  const { user } = useAuth();

  const features = [
    {
      icon: '🐾',
      title: 'Gérer les Animaux',
      description: 'Ajoutez et gérez vos animaux',
      link: '/animals',
      color: '#667eea'
    },
    {
      icon: '📋',
      title: 'Demandes d\'Adoption',
      description: 'Traitez les demandes d\'adoption',
      link: '/adoptions',
      color: '#10b981'
    },
    {
      icon: '💬',
      title: 'Messages',
      description: 'Communiquez avec les adoptants',
      link: '/messages',
      color: '#ef4444'
    },
    {
      icon: '📖',
      title: 'Historique',
      description: 'Suivez l\'historique de vos animaux',
      link: '/animals',
      color: '#f59e0b'
    },
    {
      icon: '📦',
      title: 'Stocks',
      description: 'Gérez vos stocks et fournitures',
      link: '/stocks',
      color: '#8b5cf6'
    },
    {
      icon: '📢',
      title: 'Sensibilisation',
      description: 'Créez des campagnes de sensibilisation',
      link: '/awareness',
      color: '#06b6d4'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bienvenue, {user?.shelter?.shelter_name || user?.name}! 👋</h1>
          <p className="dashboard-subtitle">Espace Refuge</p>
        </div>
        <div className="user-badge">
          <span className="badge badge-success">🏠 Refuge</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#e6eaff'}}>🐾</div>
          <div className="stat-info">
            <h3>Animaux au Refuge</h3>
            <p className="stat-number">Total</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#d1fae5'}}>✅</div>
          <div className="stat-info">
            <h3>Adoptions Réussies</h3>
            <p className="stat-number">Ce mois</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fef3c7'}}>⏳</div>
          <div className="stat-info">
            <h3>Demandes en Attente</h3>
            <p className="stat-number">À traiter</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fee2e2'}}>🏥</div>
          <div className="stat-info">
            <h3>Soins Médicaux</h3>
            <p className="stat-number">En cours</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Gestion du Refuge</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link to={feature.link} key={index} className="feature-card" style={{borderTopColor: feature.color}}>
              <div className="feature-icon" style={{color: feature.color}}>
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <button className="btn btn-secondary">Accéder →</button>
            </Link>
          ))}
        </div>
      </div>

      <div className="info-banner shelter">
        <div className="info-icon">🌟</div>
        <div className="info-content">
          <h3>Conseil du jour</h3>
          <p>Maintenez à jour les dossiers médicaux de vos animaux pour faciliter le processus d'adoption.</p>
        </div>
      </div>
    </div>
  );
}

export default ShelterDashboard;


