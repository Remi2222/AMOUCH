import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reservations.css';

const API_URL = process.env.REACT_APP_RESERVATIONS_API || 'http://localhost:3002';
const ANIMALS_API = process.env.REACT_APP_ANIMALS_API || 'http://localhost:3001';

function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    reservation_date: '',
    status: 'pending',
    notes: ''
  });

  useEffect(() => {
    fetchReservations();
    fetchAnimals();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/reservations`);
      setReservations(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
    }
  };

  const fetchAnimals = async () => {
    try {
      const response = await axios.get(`${ANIMALS_API}/api/animals`);
      setAnimals(response.data.filter(a => a.status === 'available'));
    } catch (error) {
      console.error('Erreur lors du chargement des animaux:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/reservations`, formData);
      fetchReservations();
      fetchAnimals();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/reservations/${id}`, { status });
      fetchReservations();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      try {
        await axios.delete(`${API_URL}/api/reservations/${id}`);
        fetchReservations();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const openModal = () => {
    setFormData({
      animal_id: '',
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      reservation_date: new Date().toISOString().split('T')[0],
      status: 'pending',
      notes: ''
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      confirmed: 'badge-success',
      cancelled: 'badge-danger',
      completed: 'badge-info'
    };
    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmé',
      cancelled: 'Annulé',
      completed: 'Terminé'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  const getAnimalName = (animalId) => {
    const animal = animals.find(a => a.id === animalId);
    return animal ? animal.name : 'Animal supprimé';
  };

  return (
    <div className="reservations-page">
      <div className="page-header">
        <h1>📅 Gestion des Réservations</h1>
        <button className="btn btn-primary" onClick={openModal}>
          + Nouvelle réservation
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Contact</th>
              <th>Animal</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(reservation => (
              <tr key={reservation.id}>
                <td>#{reservation.id}</td>
                <td>{reservation.customer_name}</td>
                <td>
                  <div>{reservation.customer_email}</div>
                  <div className="phone">{reservation.customer_phone}</div>
                </td>
                <td>{getAnimalName(reservation.animal_id)}</td>
                <td>{new Date(reservation.reservation_date).toLocaleDateString('fr-FR')}</td>
                <td>{getStatusBadge(reservation.status)}</td>
                <td>
                  <div className="action-buttons">
                    {reservation.status === 'pending' && (
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => updateStatus(reservation.id, 'confirmed')}
                      >
                        Confirmer
                      </button>
                    )}
                    {reservation.status === 'confirmed' && (
                      <button 
                        className="btn btn-warning btn-sm"
                        onClick={() => updateStatus(reservation.id, 'completed')}
                      >
                        Terminer
                      </button>
                    )}
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(reservation.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouvelle réservation</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Animal*</label>
                <select
                  value={formData.animal_id}
                  onChange={(e) => setFormData({...formData, animal_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un animal</option>
                  {animals.map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} - {animal.species} {animal.price ? `(${animal.price} DH)` : '(Gratuit)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Nom du client*</label>
                <input
                  type="text"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Téléphone</label>
                <input
                  type="tel"
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Date de réservation*</label>
                <input
                  type="date"
                  value={formData.reservation_date}
                  onChange={(e) => setFormData({...formData, reservation_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Créer la réservation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reservations;


