import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Appointments.css';

const API_URL = process.env.REACT_APP_APPOINTMENTS_API || 'http://localhost:3007';

function Appointments() {
  const { user, isAdopter, isShelter, isVeterinarian } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [veterinarians, setVeterinarians] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    veterinarian_id: '',
    appointment_date: '',
    appointment_type: 'consultation',
    reason: '',
    animal_id: null
  });

  useEffect(() => {
    if (user) {
      fetchAppointments();
      fetchUpcoming();
      fetchVeterinarians();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/appointments`, {
        params: {
          user_email: user?.email,
          role: user?.role
        }
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/appointments/upcoming`, {
        params: {
          user_email: user?.email,
          role: user?.role
        }
      });
      setUpcomingAppointments(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchVeterinarians = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/veterinarians`);
      setVeterinarians(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Veuillez vous connecter pour créer un rendez-vous');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/api/appointments`, {
        ...formData,
        user_email: user.email,
        user_name: user.name
      });
      fetchAppointments();
      fetchUpcoming();
      closeModal();
      alert('Rendez-vous créé avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du rendez-vous');
    }
  };

  const openModal = () => {
    setFormData({
      veterinarian_id: '',
      appointment_date: '',
      appointment_type: 'consultation',
      reason: '',
      animal_id: null
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const getTypeLabel = (type) => {
    return getAppointmentTypeLabel(type);
  };

  const getTypeIcon = (type) => {
    const icons = {
      consultation: '🩺',
      vaccination: '💉',
      surgery: '🏥',
      checkup: '📋',
      emergency: '🚨',
      teleconsultation: '💻'
    };
    return icons[type] || '📅';
  };

  const getAppointmentTypeLabel = (type) => {
    const labels = {
      consultation: 'Consultation',
      vaccination: 'Vaccination',
      surgery: 'Chirurgie',
      checkup: 'Contrôle',
      emergency: 'Urgence',
      teleconsultation: 'Téléconsultation'
    };
    return labels[type] || type;
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/appointments/${id}`, { status });
      fetchAppointments();
      fetchUpcoming();
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const cancelAppointment = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) {
      try {
        await axios.put(`${API_URL}/api/appointments/${id}`, { status: 'cancelled' });
        fetchAppointments();
        fetchUpcoming();
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'annulation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: 'badge-warning',
      confirmed: 'badge-info',
      in_progress: 'badge-primary',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      no_show: 'badge-secondary'
    };
    const labels = {
      scheduled: 'Programmé',
      confirmed: 'Confirmé',
      in_progress: 'En cours',
      completed: 'Terminé',
      cancelled: 'Annulé',
      no_show: 'Absent'
    };
    return <span className={`badge ${badges[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>📅 {isAdopter ? 'Mes Rendez-vous' : isVeterinarian ? 'Mon Calendrier' : isShelter ? 'Rendez-vous du Refuge' : 'Rendez-vous Vétérinaires'}</h1>
        {isAdopter && (
          <button className="btn btn-primary" onClick={openModal}>
            + Prendre un rendez-vous
          </button>
        )}
      </div>

      {/* Prochains rendez-vous */}
      <div className="section">
        <h2>🔜 Rendez-vous à Venir</h2>
        <div className="upcoming-grid">
          {upcomingAppointments.map(apt => (
            <div key={apt.id} className="appointment-card upcoming">
              <div className="apt-icon">{getTypeIcon(apt.appointment_type)}</div>
              <div className="apt-info">
                <h3>{apt.animal_name || 'Sans animal'}</h3>
                <p><strong>{getTypeLabel(apt.appointment_type)}</strong></p>
                <p>👨‍⚕️ {apt.veterinarian_name}</p>
                <p>🏥 {apt.clinic_name}</p>
                <p>📅 {new Date(apt.appointment_date).toLocaleString('fr-FR')}</p>
                <p className="reason">{apt.reason}</p>
                <div className="apt-status">
                  {getStatusBadge(apt.status)}
                </div>
              </div>
              {apt.status === 'scheduled' && (
                <div className="apt-actions">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => updateStatus(apt.id, 'confirmed')}
                  >
                    Confirmer
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => updateStatus(apt.id, 'cancelled')}
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Vétérinaires disponibles */}
      <div className="section">
        <h2>👨‍⚕️ Vétérinaires Disponibles</h2>
        <div className="vet-grid">
          {veterinarians.map(vet => (
            <div key={vet.id} className="vet-card">
              <h3>{vet.name}</h3>
              <p><strong>{vet.clinic_name}</strong></p>
              <p>📍 {vet.city}</p>
              <p>🎓 {vet.specialization}</p>
              <p>💼 {vet.years_experience} ans d'expérience</p>
              <div className="vet-fees">
                <div className="fee">
                  <span>Consultation:</span>
                  <strong>{vet.consultation_fee} DH</strong>
                </div>
                {vet.teleconsultation_available && (
                  <div className="fee">
                    <span>Téléconsultation:</span>
                    <strong>{vet.teleconsultation_fee} DH</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tous les rendez-vous */}
      <div className="section">
        <h2>📋 {isAdopter ? 'Mes Rendez-vous' : isVeterinarian ? 'Mes Consultations' : 'Historique des Rendez-vous'}</h2>
        <div className="table-container">
          <table className="table">
            <thead>
                <tr>
                <th>Type</th>
                <th>Animal</th>
                {!isAdopter && <th>Client</th>}
                <th>Vétérinaire</th>
                <th>Date</th>
                <th>Motif</th>
                <th>Statut</th>
                <th>Montant</th>
                {!isAdopter && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt.id}>
                  <td>{getTypeIcon(apt.appointment_type)} {getTypeLabel(apt.appointment_type)}</td>
                  <td>
                    {apt.animal_name ? (
                      <>
                        <strong>{apt.animal_name}</strong>
                        {apt.species && <><br /><small>{apt.species} {apt.breed ? `- ${apt.breed}` : ''}</small></>}
                      </>
                    ) : 'N/A'}
                  </td>
                  {!isAdopter && (
                    <td>
                      <strong>{apt.user_name || 'N/A'}</strong>
                      {apt.user_email && <><br /><small>{apt.user_email}</small></>}
                    </td>
                  )}
                  <td>
                    {apt.veterinarian_name}<br/>
                    <small>{apt.clinic_name}</small>
                  </td>
                  <td>{new Date(apt.appointment_date).toLocaleString('fr-FR')}</td>
                  <td>{apt.reason || 'N/A'}</td>
                  <td>{getStatusBadge(apt.status)}</td>
                  <td>{apt.fee ? `${apt.fee} DH` : 'Gratuit'}</td>
                  {!isAdopter && (
                    <td>
                      {apt.status === 'scheduled' && (
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                        >
                          ✓ Confirmer
                        </button>
                      )}
                      {apt.status === 'confirmed' && (
                        <button 
                          className="btn btn-info btn-sm"
                          onClick={() => updateStatus(apt.id, 'completed')}
                        >
                          ✓ Terminer
                        </button>
                      )}
                      {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                        >
                          ✗ Annuler
                        </button>
                      )}
                    </td>
                  )}
                  {isAdopter && apt.status !== 'completed' && apt.status !== 'cancelled' && (
                    <td>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => cancelAppointment(apt.id)}
                      >
                        ✗ Annuler
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nouveau Rendez-vous</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {user && (
                <div className="form-group">
                  <label>Vous réservez en tant que:</label>
                  <input
                    type="text"
                    value={`${user.name || ''} (${user.email})`}
                    disabled
                    style={{ background: '#f0f0f0' }}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Type de Rendez-vous*</label>
                <select
                  value={formData.appointment_type}
                  onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="checkup">Contrôle</option>
                  <option value="surgery">Chirurgie</option>
                  <option value="emergency">Urgence</option>
                  <option value="teleconsultation">Téléconsultation</option>
                </select>
              </div>
              <div className="form-group">
                <label>Vétérinaire*</label>
                <select
                  value={formData.veterinarian_id}
                  onChange={(e) => setFormData({...formData, veterinarian_id: e.target.value})}
                  required
                >
                  <option value="">Sélectionner un vétérinaire</option>
                  {veterinarians.map(vet => (
                    <option key={vet.id} value={vet.id}>
                      {vet.name} - {vet.clinic_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date et Heure*</label>
                <input
                  type="datetime-local"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({...formData, appointment_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Motif de la consultation*</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows="4"
                  placeholder="Décrivez la raison de votre visite..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Prendre Rendez-vous
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;


