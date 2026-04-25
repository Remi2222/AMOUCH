import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function AdopterDashboard() {
  const { user } = useAuth();

  const features = [
    {
      icon: '🐾',
      title: 'Parcourir les Animaux',
      description: 'Découvrez tous les animaux disponibles à l\'adoption',
      link: '/animals',
      color: '#667eea'
    },
    {
      icon: '🏠',
      title: 'Mes Adoptions',
      description: 'Suivez vos demandes d\'adoption en cours',
      link: '/adoptions',
      color: '#10b981'
    },
    {
      icon: '📅',
      title: 'Rendez-vous Vétérinaire',
      description: 'Prenez rendez-vous pour vos animaux',
      link: '/appointments',
      color: '#f59e0b'
    },
    {
      icon: '💬',
      title: 'Messages',
      description: 'Discutez avec les refuges',
      link: '/messages',
      color: '#ef4444'
    },
    {
      icon: '📢',
      title: 'Sensibilisation',
      description: 'Informez-vous sur le bien-être animal',
      link: '/awareness',
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bienvenue, {user?.name}! 👋</h1>
          <p className="dashboard-subtitle">Espace Adoptant</p>
        </div>
        <div className="user-badge">
          <span className="badge badge-info">👤 Adoptant</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#e6eaff'}}>🐾</div>
          <div className="stat-info">
            <h3>Animaux Disponibles</h3>
            <p className="stat-number">Voir tous</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#d1fae5'}}>📋</div>
          <div className="stat-info">
            <h3>Mes Demandes</h3>
            <p className="stat-number">En cours</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fef3c7'}}>📅</div>
          <div className="stat-info">
            <h3>RDV à venir</h3>
            <p className="stat-number">Prochains</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Que souhaitez-vous faire ?</h2>
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

      <div className="info-banner">
        <div className="info-icon">💡</div>
        <div className="info-content">
          <h3>Conseils pour l'adoption</h3>
          <p>L'adoption d'un animal est un engagement à long terme. Assurez-vous d'être prêt à offrir amour, soins et attention.</p>
        </div>
      </div>
    </div>
  );
}

export default AdopterDashboard;


