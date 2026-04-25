import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>مرحبًا بكم في AMOUCH 🐾</h1>
        <p>منصة المغرب لإدارة الحيوانات والتبني</p>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">🐶</div>
          <h3>Gestion des Animaux</h3>
          <p>Profils complets avec santé, âge, poids et comportement</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏥</div>
          <h3>Vétérinaire</h3>
          <p>Dossiers médicaux, vaccinations, médicaments et traitements</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🏠</div>
          <h3>Adoptions</h3>
          <p>Gestion complète des demandes d'adoption et suivi</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📢</div>
          <h3>Sensibilisation</h3>
          <p>Campagnes d'éducation et de prévention pour le bien-être animal</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📅</div>
          <h3>Réservations</h3>
          <p>Système de réservation simple et efficace</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h3>Gestion des Stocks</h3>
          <p>Produits alimentaires et matériel médical</p>
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <h2>🇲🇦</h2>
          <p>Made in Morocco</p>
        </div>
        <div className="stat">
          <h2>⚡</h2>
          <p>أداء ممتاز - Performance Optimale</p>
        </div>
        <div className="stat">
          <h2>🔒</h2>
          <p>بيانات آمنة - Données Sécurisées</p>
        </div>
      </div>
    </div>
  );
}

export default Home;

