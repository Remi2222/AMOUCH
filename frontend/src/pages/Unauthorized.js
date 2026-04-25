import React from 'react';
import { Link } from 'react-router-dom';
import './Unauthorized.css';

function Unauthorized() {
  return (
    <div className="unauthorized-container">
      <div className="unauthorized-content">
        <h1>🚫</h1>
        <h2>Accès Non Autorisé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <Link to="/" className="btn btn-primary">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;


