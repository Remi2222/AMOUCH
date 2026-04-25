import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

function VeterinarianDashboard() {
  const { user } = useAuth();

  const features = [
    {
      icon: '📅',
      title: 'Calendrier RDV',
      description: 'Gérez vos rendez-vous',
      link: '/appointments',
      color: '#667eea'
    },
    {
      icon: '🏥',
      title: 'Dossiers Médicaux',
      description: 'Consultez et créez des dossiers',
      link: '/veterinary',
      color: '#10b981'
    },
    {
      icon: '💉',
      title: 'Vaccinations',
      description: 'Suivez les vaccinations',
      link: '/veterinary',
      color: '#f59e0b'
    },
    {
      icon: '💊',
      title: 'Prescriptions',
      description: 'Émettez des prescriptions',
      link: '/veterinary',
      color: '#ef4444'
    },
    {
      icon: '💻',
      title: 'Téléconsultations',
      description: 'Consultations à distance',
      link: '/appointments',
      color: '#8b5cf6'
    },
    {
      icon: '📊',
      title: 'Statistiques',
      description: 'Vos statistiques d\'activité',
      link: '/veterinary',
      color: '#06b6d4'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dr. {user?.name}! 👋</h1>
          <p className="dashboard-subtitle">Espace Vétérinaire</p>
        </div>
        <div className="user-badge">
          <span className="badge badge-warning">👨‍⚕️ Vétérinaire</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#e6eaff'}}>📅</div>
          <div className="stat-info">
            <h3>RDV Aujourd'hui</h3>
            <p className="stat-number">À venir</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#d1fae5'}}>✅</div>
          <div className="stat-info">
            <h3>Consultations</h3>
            <p className="stat-number">Ce mois</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fef3c7'}}>💊</div>
          <div className="stat-info">
            <h3>Prescriptions</h3>
            <p className="stat-number">Cette semaine</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{background: '#fee2e2'}}>💻</div>
          <div className="stat-info">
            <h3>Téléconsultations</h3>
            <p className="stat-number">Disponibles</p>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Outils Vétérinaires</h2>
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

      <div className="upcoming-appointments">
        <h2>Prochains Rendez-vous</h2>
        <div className="appointment-list">
          <div className="appointment-item">
            <div className="apt-time">
              <span className="time">--:--</span>
              <span className="date">Aujourd'hui</span>
            </div>
            <div className="apt-details">
              <h4>Aucun rendez-vous prévu</h4>
              <p>Votre agenda est vide pour aujourd'hui</p>
            </div>
          </div>
        </div>
      </div>

      <div className="info-banner veterinarian">
        <div className="info-icon">⚕️</div>
        <div className="info-content">
          <h3>Rappel Professionnel</h3>
          <p>N'oubliez pas de mettre à jour les dossiers médicaux après chaque consultation.</p>
        </div>
      </div>
    </div>
  );
}

export default VeterinarianDashboard;


