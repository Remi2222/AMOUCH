import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Adoptions.css';

const API_URL = process.env.REACT_APP_ADOPTIONS_API || 'http://localhost:3003';

function Adoptions() {
  const { user, isAdopter, isShelter } = useAuth();
  const [adoptions, setAdoptions] = useState([]);
  const [adoptableAnimals, setAdoptableAnimals] = useState([]);
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [formData, setFormData] = useState({
    adopter_name: '',
    adopter_email: '',
    adopter_phone: '',
    adopter_address: '',
    adoption_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchAdoptions();
    fetchAdoptableAnimals();
    fetchStats();
  }, []);

  const fetchAdoptions = async () => {
    try {
      let response;
      // Si c'est un adoptant, récupérer seulement ses demandes
      if (isAdopter && user) {
        response = await axios.get(`${API_URL}/api/adoptions`);
        // Filtrer les adoptions de l'utilisateur connecté
        const userAdoptions = response.data.filter(adoption => 
          adoption.adopter_email === user.email
        );
        setAdoptions(userAdoptions);
      } else {
        // Refuges et autres voient toutes les adoptions
        response = await axios.get(`${API_URL}/api/adoptions`);
        setAdoptions(response.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchAdoptableAnimals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/adoptions/animals/available`);
      setAdoptableAnimals(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/adoptions/stats/overview`);
      setStats(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/adoptions`, {
        ...formData,
        animal_id: selectedAnimal.id
      });
      fetchAdoptions();
      fetchAdoptableAnimals();
      fetchStats();
      closeModal();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la demande d\'adoption');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/adoptions/${id}`, { status });
      fetchAdoptions();
      fetchStats();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openModal = (animal) => {
    setSelectedAnimal(animal);
    setFormData({
      adopter_name: '',
      adopter_email: '',
      adopter_phone: '',
      adopter_address: '',
      adoption_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnimal(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      completed: 'badge-info',
      cancelled: 'badge-danger'
    };
    const labels = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      completed: 'Terminé',
      cancelled: 'Annulé'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  const getHealthBadge = (status) => {
    const badges = {
      healthy: 'badge-success',
      sick: 'badge-danger',
      recovering: 'badge-warning',
      critical: 'badge-danger'
    };
    const labels = {
      healthy: 'Bonne santé',
      sick: 'Malade',
      recovering: 'En convalescence',
      critical: 'État critique'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="adoptions-page">
      <div className="page-header">
        <h1>🏠 Adoptions</h1>
      </div>

      {/* Statistiques - Seulement pour refuges */}
      {stats && !isAdopter && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🐾</div>
            <div className="stat-info">
              <h3>{stats.animals.adoptable}</h3>
              <p>Animaux Adoptables</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.adoptions.pending}</h3>
              <p>Demandes en Attente</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.adoptions.completed}</h3>
              <p>Adoptions Réussies</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>{stats.animals.adopted}</h3>
              <p>Animaux Adoptés</p>
            </div>
          </div>
        </div>
      )}

      {/* Animaux adoptables */}
      <div className="section">
        <h2>🐾 Animaux Disponibles pour Adoption</h2>
        <div className="animals-grid">
          {adoptableAnimals.map(animal => (
            <div key={animal.id} className="animal-adoption-card">
              <div className="animal-image">
                {animal.image_url ? (
                  <img src={animal.image_url} alt={animal.name} />
                ) : (
                  <div className="no-image">📷</div>
                )}
              </div>
              <div className="animal-details">
                <h3>{animal.name}</h3>
                <p><strong>{animal.species}</strong> - {animal.breed || 'Race mixte'}</p>
                <p>🎂 {animal.age_years || 0} an(s) {animal.age_months || 0} mois</p>
                <p>⚖️ {animal.weight} kg</p>
                <p>🎨 {animal.color}</p>
                <div className="health-status">
                  {getHealthBadge(animal.health_status)}
                </div>
                {animal.description && (
                  <p className="description">{animal.description}</p>
                )}
                <button 
                  className="btn btn-primary"
                  onClick={() => openModal(animal)}
                >
                  📝 Demander l'adoption
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Demandes d'adoption */}
      <div className="section">
        <h2>📋 {isAdopter ? 'Mes Demandes d\'Adoption' : 'Demandes d\'Adoption'}</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Animal</th>
                {!isAdopter && <th>Adoptant</th>}
                {!isAdopter && <th>Contact</th>}
                <th>Date</th>
                <th>Statut</th>
                {!isAdopter && <th>Actions</th>}
                {isAdopter && <th>Détails</th>}
              </tr>
            </thead>
            <tbody>
              {adoptions.map(adoption => (
                <tr key={adoption.id}>
                  <td>
                    <strong>{adoption.animal_name}</strong><br />
                    <small>{adoption.species} - {adoption.breed}</small>
                  </td>
                  {!isAdopter && <td>{adoption.adopter_name}</td>}
                  {!isAdopter && (
                    <td>
                      <div>{adoption.adopter_email}</div>
                      <div className="phone">{adoption.adopter_phone}</div>
                    </td>
                  )}
                  <td>{new Date(adoption.adoption_date).toLocaleDateString('fr-FR')}</td>
                  <td>{getStatusBadge(adoption.status)}</td>
                  {!isAdopter && (
                    <td>
                      <div className="action-buttons">
                        {adoption.status === 'pending' && (
                          <>
                            <button 
                              className="btn btn-success btn-sm"
                              onClick={() => updateStatus(adoption.id, 'approved')}
                            >
                              ✓ Approuver
                            </button>
                            <button 
                              className="btn btn-danger btn-sm"
                              onClick={() => updateStatus(adoption.id, 'rejected')}
                            >
                              ✗ Rejeter
                            </button>
                          </>
                        )}
                        {adoption.status === 'approved' && (
                          <button 
                            className="btn btn-info btn-sm"
                            onClick={() => updateStatus(adoption.id, 'completed')}
                          >
                            ✓ Finaliser
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                  {isAdopter && (
                    <td>
                      <span className="badge">
                        {adoption.status === 'pending' && '⏳ En attente'}
                        {adoption.status === 'approved' && '✅ Approuvée'}
                        {adoption.status === 'rejected' && '❌ Rejetée'}
                        {adoption.status === 'completed' && '🎉 Finalisée'}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de demande d'adoption */}
      {showModal && selectedAnimal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Demande d'adoption - {selectedAnimal.name}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom complet*</label>
                <input
                  type="text"
                  value={formData.adopter_name}
                  onChange={(e) => setFormData({...formData, adopter_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={formData.adopter_email}
                  onChange={(e) => setFormData({...formData, adopter_email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone*</label>
                <input
                  type="tel"
                  value={formData.adopter_phone}
                  onChange={(e) => setFormData({...formData, adopter_phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Adresse complète*</label>
                <textarea
                  value={formData.adopter_address}
                  onChange={(e) => setFormData({...formData, adopter_address: e.target.value})}
                  rows="3"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date souhaitée*</label>
                <input
                  type="date"
                  value={formData.adoption_date}
                  onChange={(e) => setFormData({...formData, adoption_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes / Motivations</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="4"
                  placeholder="Pourquoi souhaitez-vous adopter cet animal ?"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Adoptions;


