import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Veterinary.css';

const API_URL = process.env.REACT_APP_VETERINARY_API || 'http://localhost:3002';
const ANIMALS_API = process.env.REACT_APP_ANIMALS_API || 'http://localhost:3001';

function Veterinary() {
  const [activeTab, setActiveTab] = useState('records');
  const [animals, setAnimals] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    fetchAnimals();
    fetchMedicalRecords();
    fetchVaccinations();
    fetchMedications();
    fetchTreatments();
  }, []);

  const fetchAnimals = async () => {
    try {
      const response = await axios.get(`${ANIMALS_API}/api/animals`);
      setAnimals(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMedicalRecords = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/medical-records`);
      setMedicalRecords(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchVaccinations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vaccinations`);
      setVaccinations(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchMedications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/medications`);
      setMedications(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const fetchTreatments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/treatments`);
      setTreatments(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getMedicationType = (type) => {
    const types = {
      antibiotic: 'Antibiotique',
      painkiller: 'Antidouleur',
      vaccine: 'Vaccin',
      supplement: 'Supplément',
      antiparasitic: 'Antiparasitaire',
      other: 'Autre'
    };
    return types[type] || type;
  };

  return (
    <div className="veterinary-page">
      <div className="page-header">
        <h1>🏥 Gestion Vétérinaire</h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          📋 Dossiers Médicaux
        </button>
        <button 
          className={`tab ${activeTab === 'vaccinations' ? 'active' : ''}`}
          onClick={() => setActiveTab('vaccinations')}
        >
          💉 Vaccinations
        </button>
        <button 
          className={`tab ${activeTab === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveTab('medications')}
        >
          💊 Médicaments
        </button>
        <button 
          className={`tab ${activeTab === 'treatments' ? 'active' : ''}`}
          onClick={() => setActiveTab('treatments')}
        >
          🩺 Traitements
        </button>
      </div>

      {/* Dossiers Médicaux */}
      {activeTab === 'records' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Dossiers Médicaux</h2>
          </div>
          <div className="records-grid">
            {medicalRecords.map(record => (
              <div key={record.id} className="record-card">
                <h3>{record.animal_name} ({record.species})</h3>
                <p><strong>Date:</strong> {new Date(record.visit_date).toLocaleDateString('fr-FR')}</p>
                <p><strong>Vétérinaire:</strong> {record.veterinarian_name || 'N/A'}</p>
                <p><strong>Diagnostic:</strong> {record.diagnosis}</p>
                <p><strong>Traitement:</strong> {record.treatment}</p>
                {record.notes && <p className="notes">{record.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vaccinations */}
      {activeTab === 'vaccinations' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Vaccinations</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Vaccin</th>
                  <th>Date</th>
                  <th>Prochain Rappel</th>
                  <th>Vétérinaire</th>
                </tr>
              </thead>
              <tbody>
                {vaccinations.map(vacc => (
                  <tr key={vacc.id}>
                    <td>{vacc.animal_name} ({vacc.species})</td>
                    <td>{vacc.vaccine_name}</td>
                    <td>{new Date(vacc.vaccination_date).toLocaleDateString('fr-FR')}</td>
                    <td>{vacc.next_due_date ? new Date(vacc.next_due_date).toLocaleDateString('fr-FR') : 'N/A'}</td>
                    <td>{vacc.veterinarian || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Médicaments */}
      {activeTab === 'medications' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Médicaments</h2>
          </div>
          <div className="medications-grid">
            {medications.map(med => (
              <div key={med.id} className="medication-card">
                <h3>{med.name}</h3>
                <p><span className="badge badge-info">{getMedicationType(med.type)}</span></p>
                <p><strong>Dosage:</strong> {med.dosage_info || 'N/A'}</p>
                <p><strong>Stock:</strong> {med.stock_quantity} unités</p>
                <p><strong>Prix:</strong> {med.unit_price} DH</p>
                {med.requires_prescription && <span className="badge badge-warning">Sur ordonnance</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Traitements */}
      {activeTab === 'treatments' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Traitements en Cours</h2>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Animal</th>
                  <th>Médicament</th>
                  <th>Dosage</th>
                  <th>Début</th>
                  <th>Fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map(treatment => {
                  const statusClass = {
                    active: 'badge-success',
                    completed: 'badge-info',
                    discontinued: 'badge-danger'
                  };
                  const statusLabel = {
                    active: 'Actif',
                    completed: 'Terminé',
                    discontinued: 'Arrêté'
                  };
                  return (
                    <tr key={treatment.id}>
                      <td>{treatment.animal_name}</td>
                      <td>{treatment.medication_name}</td>
                      <td>{treatment.dosage} - {treatment.frequency}</td>
                      <td>{new Date(treatment.start_date).toLocaleDateString('fr-FR')}</td>
                      <td>{treatment.end_date ? new Date(treatment.end_date).toLocaleDateString('fr-FR') : 'En cours'}</td>
                      <td><span className={`badge ${statusClass[treatment.status]}`}>{statusLabel[treatment.status]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Veterinary;


