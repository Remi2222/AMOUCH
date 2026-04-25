import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Stocks.css';

const API_URL = process.env.REACT_APP_STOCKS_API || 'http://localhost:3003';

function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentStock, setCurrentStock] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    quantity: '',
    unit_price: '',
    supplier: '',
    min_quantity: '10',
    description: ''
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stocks`);
      setStocks(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des stocks:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentStock) {
        await axios.put(`${API_URL}/api/stocks/${currentStock.id}`, formData);
      } else {
        await axios.post(`${API_URL}/api/stocks`, formData);
      }
      fetchStocks();
      closeModal();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await axios.delete(`${API_URL}/api/stocks/${id}`);
        fetchStocks();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const updateQuantity = async (id, quantity) => {
    try {
      await axios.put(`${API_URL}/api/stocks/${id}`, { quantity });
      fetchStocks();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const openModal = (stock = null) => {
    if (stock) {
      setCurrentStock(stock);
      setFormData(stock);
    } else {
      setCurrentStock(null);
      setFormData({
        product_name: '',
        category: '',
        quantity: '',
        unit_price: '',
        supplier: '',
        min_quantity: '10',
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentStock(null);
  };

  const getStockStatus = (quantity, minQuantity) => {
    if (quantity === 0) {
      return { label: 'Rupture', class: 'badge-danger' };
    } else if (quantity <= minQuantity) {
      return { label: 'Faible', class: 'badge-warning' };
    } else {
      return { label: 'Disponible', class: 'badge-success' };
    }
  };

  return (
    <div className="stocks-page">
      <div className="page-header">
        <h1>📦 Gestion des Stocks</h1>
        <button className="btn btn-primary" onClick={() => openModal()}>
          + Ajouter un produit
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Fournisseur</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => {
              const status = getStockStatus(stock.quantity, stock.min_quantity);
              return (
                <tr key={stock.id}>
                  <td>
                    <strong>{stock.product_name}</strong>
                    {stock.description && <div className="description-small">{stock.description}</div>}
                  </td>
                  <td>{stock.category}</td>
                  <td>
                    <div className="quantity-control">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(stock.id, Math.max(0, stock.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="qty-value">{stock.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(stock.id, stock.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="min-qty">Min: {stock.min_quantity}</div>
                  </td>
                  <td>{stock.unit_price} DH</td>
                  <td>{stock.supplier || 'N/A'}</td>
                  <td>
                    <span className={`badge ${status.class}`}>{status.label}</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => openModal(stock)}
                      >
                        Modifier
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(stock.id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{currentStock ? 'Modifier' : 'Ajouter'} un produit</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom du produit*</label>
                <input
                  type="text"
                  value={formData.product_name}
                  onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Catégorie*</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantité*</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Prix unitaire (DH)*</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Fournisseur</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Quantité minimale*</label>
                <input
                  type="number"
                  value={formData.min_quantity}
                  onChange={(e) => setFormData({...formData, min_quantity: e.target.value})}
                  required
                />
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
                {currentStock ? 'Modifier' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stocks;


