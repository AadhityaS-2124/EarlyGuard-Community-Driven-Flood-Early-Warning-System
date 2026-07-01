import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import ReportForm from './components/ReportForm';
import AlertsPage from './components/AlertsPage';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { initializeNotifications } from './services/notification';
import './App.css';
import './styles/HomePage.css';
import './styles/Header.css';
import './styles/Auth.css';

function App() {
  useEffect(() => {
    // Initialize notifications when the app loads
    initializeNotifications().catch(error => {
      console.error('Failed to initialize notifications:', error);
    });
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/report" element={
                <ProtectedRoute>
                  <ReportForm />
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
