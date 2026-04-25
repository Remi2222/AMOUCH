import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Animals.css';

const API_URL = process.env.REACT_APP_ANIMALS_API || 'http://localhost:3001';

function Animals() {
  const { user, isAdopter } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age_years: '',
    age_months: '',
    price: '',
    description: '',
    status: 'available'
  });

  useEffect(() => {
    fetchAnimals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdopter, user]);

  const fetchAnimals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/animals`);
      let animalsData = response.data;
      
      // Si c'est un adoptant ou un visiteur, filtrer seulement les animaux adoptables
      if (isAdopter || !user) {
        animalsData = animalsData.filter(animal => 
          animal.adoption_status === 'adoptable' && 
          animal.status === 'available'
        );
      }
      
      setAnimals(animalsData);
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAnimal) {
        await axios.put(`${API_URL}/api/animals/${currentAnimal.id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/animals`, formData);
      }
      fetchAnimals();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet animal ?')) {
      try {
        await axios.delete(`${API_URL}/api/animals/${id}`);
        fetchAnimals();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openModal = (animal = null) => {
    if (animal) {
      setCurrentAnimal(animal);
      setFormData(animal);
    } else {
      setCurrentAnimal(null);
      setFormData({
        name: '',
        species: '',
        breed: '',
        age_years: '',
        age_months: '',
        price: '',
        description: '',
        status: 'available'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentAnimal(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'badge-success',
      reserved: 'badge-warning',
      sold: 'badge-danger'
    };
    const labels = {
      available: 'Disponible',
      reserved: 'Réservé',
      sold: 'Vendu'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="animals-page">
      <div className="page-header">
        <h1>🐾 {user && !isAdopter ? 'Gestion des Animaux' : 'Animaux Disponibles'}</h1>
        {user && !isAdopter && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            + Ajouter un animal
          </button>
        )}
      </div>

      <div className="animals-grid">
        {animals.map(animal => (
          <div key={animal.id} className="animal-card">
            <div className="animal-header">
              <h3>{animal.name}</h3>
              {getStatusBadge(animal.status)}
            </div>
            <div className="animal-info">
              <p><strong>Espèce:</strong> {animal.species}</p>
              <p><strong>Race:</strong> {animal.breed || 'N/A'}</p>
              <p><strong>Âge:</strong> {animal.age_years || 0} an(s) {animal.age_months || 0} mois</p>
              <p><strong>Prix:</strong> {animal.price ? `${animal.price} DH` : 'Adoption gratuite'}</p>
              {animal.description && <p className="description">{animal.description}</p>}
            </div>
            {user && !isAdopter && (
              <div className="animal-actions">
                <button className="btn btn-success" onClick={() => openModal(animal)}>
                  Modifier
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(animal.id)}>
                  Supprimer
                </button>
              </div>
            )}
            {user && isAdopter && (
              <div className="animal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/adoptions'}
                >
                  📝 Demander l'adoption
                </button>
              </div>
            )}
            {!user && (
              <div className="animal-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.href = '/login'}
                >
                  🔐 Se connecter pour adopter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && user && !isAdopter && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentAnimal ? 'Modifier' : 'Ajouter'} un animal</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom*</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Espèce*</label>
                <input
                  type="text"
                  value={formData.species}
                  onChange={(e) => setFormData({...formData, species: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Race</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Âge (années)*</label>
                <input
                  type="number"
                  value={formData.age_years}
                  onChange={(e) => setFormData({...formData, age_years: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Âge (mois)*</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={formData.age_months}
                  onChange={(e) => setFormData({...formData, age_months: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prix (DH) - Optionnel</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Statut*</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">Réservé</option>
                  <option value="sold">Vendu</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {currentAnimal ? 'Modifier' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Animals;


