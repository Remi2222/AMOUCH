import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages publiques
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import CyberConsumptionPresentation from './pages/CyberConsumptionPresentation';

// Pages protégées
import Animals from './pages/Animals';
import Veterinary from './pages/Veterinary';
import Adoptions from './pages/Adoptions';
import Awareness from './pages/Awareness';
import Appointments from './pages/Appointments';
import Messages from './pages/Messages';
import Reservations from './pages/Reservations';
import Stocks from './pages/Stocks';

// Dashboards
import AdopterDashboard from './pages/dashboards/AdopterDashboard';
import ShelterDashboard from './pages/dashboards/ShelterDashboard';
import VeterinarianDashboard from './pages/dashboards/VeterinarianDashboard';

function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo"><span>🐾</span> AMOUCH</Link>
        
        {isAuthenticated ? (
          <>
            <ul className="nav-menu">
              <li><Link to={`/dashboard/${user?.role}`}>Dashboard</Link></li>
              {(user?.role === 'adopter' || user?.role === 'shelter') && (
                <>
                  <li><Link to="/animals">Animaux</Link></li>
                  <li><Link to="/adoptions">Adoptions</Link></li>
                </>
              )}
              {user?.role === 'veterinarian' && (
                <>
                  <li><Link to="/appointments">Rendez-vous</Link></li>
                  <li><Link to="/veterinary">Médical</Link></li>
                </>
              )}
              {user?.role === 'shelter' && (
                <li><Link to="/stocks">Stocks</Link></li>
              )}
              <li><Link to="/messages">Messages</Link></li>
              <li><Link to="/awareness">Sensibilisation</Link></li>
            </ul>
            <div className="nav-user">
              <span className="user-name">👤 {user?.name}</span>
              <button onClick={logout} className="btn-logout">Déconnexion</button>
            </div>
          </>
        ) : (
          <>
            <ul className="nav-menu">
              <li><Link to="/">Accueil</Link></li>
              <li><Link to="/animals">Animaux</Link></li>
              <li><Link to="/awareness">Sensibilisation</Link></li>
            </ul>
            <div className="nav-auth">
              <Link to="/login" className="btn btn-secondary">Connexion</Link>
              <Link to="/register" className="btn btn-primary">Inscription</Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function AppContent() {
  return (
    <div className="App">
      <Navigation />

      <main className="main-content">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/animals" element={<Animals />} />
          <Route path="/awareness" element={<Awareness />} />
          <Route path="/presentation" element={<CyberConsumptionPresentation />} />

          {/* Dashboards protégés */}
          <Route 
            path="/dashboard/adopter" 
            element={
              <PrivateRoute allowedRoles={['adopter']}>
                <AdopterDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/shelter" 
            element={
              <PrivateRoute allowedRoles={['shelter']}>
                <ShelterDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/veterinarian" 
            element={
              <PrivateRoute allowedRoles={['veterinarian']}>
                <VeterinarianDashboard />
              </PrivateRoute>
            } 
          />

          {/* Routes protégées */}
          <Route 
            path="/veterinary" 
            element={
              <PrivateRoute allowedRoles={['veterinarian', 'shelter']}>
                <Veterinary />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <PrivateRoute>
                <Appointments />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/adoptions" 
            element={
              <PrivateRoute>
                <Adoptions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/messages" 
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/stocks" 
            element={
              <PrivateRoute allowedRoles={['shelter']}>
                <Stocks />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reservations" 
            element={
              <PrivateRoute>
                <Reservations />
              </PrivateRoute>
            } 
          />

          {/* Redirection par défaut */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

        <footer className="footer">
          <p>&copy; 2025 AMOUCH - منصة المغرب للطب البيطري والتبني - Plateforme Vétérinaire & Adoption Maroc. Tous droits réservés.</p>
        </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;

