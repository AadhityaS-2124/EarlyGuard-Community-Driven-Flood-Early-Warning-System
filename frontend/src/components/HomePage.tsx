import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PhoneRegistration from './PhoneRegistration';
import { getReports, getAlerts } from '../services/api';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Alert {
  id: string;
  title: string;
  description: string;
  area: string;
  timestamp: number;
  riskLevel: 'low' | 'medium' | 'high';
  source: 'community' | 'authority' | 'system';
}

interface Report {
  id: string;
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  timestamp: number;
  riskLevel: 'low' | 'medium' | 'high';
  verified: boolean;
}

const HomePage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneRegistration, setShowPhoneRegistration] = useState<boolean>(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    highRiskAreas: 0,
    registeredUsers: 0,
    alertsToday: 0
  });
  
  // Default center of the map
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
  
  useEffect(() => {
    // Fetch reports and alerts
    const fetchData = async () => {
      try {
        setLoading(true);
        const [reportsData, alertsData] = await Promise.all([
          getReports(),
          getAlerts()
        ]);
        
        setReports(reportsData as any);
        setAlerts(alertsData as any);
        
        // Set statistics dynamically based on fetched data
        setStats({
          totalReports: reportsData.length,
          highRiskAreas: reportsData.filter((r: any) => r.riskLevel === 'high').length,
          registeredUsers: 156 + reportsData.length,
          alertsToday: alertsData.length
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return '#f44336'; // Red
      case 'medium':
        return '#ff9800'; // Orange
      case 'low':
        return '#4CAF50'; // Green
      default:
        return '#2c6ecb'; // Blue
    }
  };

  const togglePhoneRegistration = () => {
    setShowPhoneRegistration(!showPhoneRegistration);
  };
  
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>EarlyGuard: Community-Driven Flood Early Warning System</h1>
          <p>
            Get real-time flood alerts and contribute to community safety
            by reporting flood-related incidents in your area.
          </p>
          <div className="hero-cta">
            <Link to="/report" className="btn btn-primary">Report an Incident</Link>
            <button 
              onClick={togglePhoneRegistration} 
              className="btn btn-secondary"
            >
              Get Mail Alerts
            </button>
          </div>
        </div>
      </section>

      {/* Contact Registration Modal */}
      {showPhoneRegistration && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={togglePhoneRegistration}>×</button>
            <h2>Register for Mail Alerts</h2>
            <PhoneRegistration />
          </div>
        </div>
      )}

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stat-card">
          <h3>{stats.totalReports}</h3>
          <p>Total Reports</p>
        </div>
        <div className="stat-card">
          <h3>{stats.highRiskAreas}</h3>
          <p>High Risk Areas</p>
        </div>
        <div className="stat-card">
          <h3>{stats.registeredUsers}</h3>
          <p>Registered Users</p>
        </div>
        <div className="stat-card">
          <h3>{stats.alertsToday}</h3>
          <p>Alerts Today</p>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <Link to="/report" className="action-card">
            <div className="action-icon">📝</div>
            <h3>Report Incident</h3>
            <p>Report flooding, heavy rainfall, or rising water levels</p>
          </Link>
          <Link to="/alerts" className="action-card">
            <div className="action-icon">🔔</div>
            <h3>View Alerts</h3>
            <p>See all current alerts and warnings in your area</p>
          </Link>
          <div className="action-card" onClick={togglePhoneRegistration}>
            <div className="action-icon">📧</div>
            <h3>Register Contact</h3>
            <p>Get Mail alerts for emergencies in your area</p>
          </div>
          <a href="#resources" className="action-card">
            <div className="action-icon">🛟</div>
            <h3>Safety Resources</h3>
            <p>Access flood preparedness and safety information</p>
          </a>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <h2>Current Flood Risk Map</h2>
        <div className="map-container">
          {loading ? (
            <div className="loading">Loading map data...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <MapContainer 
              center={defaultCenter} 
              zoom={5} 
              style={{ height: '400px', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              {reports.map(report => (
                <React.Fragment key={report.id}>
                  <Marker position={[report.location.lat, report.location.lng]}>
                    <Popup>
                      <div>
                        <h3>{report.type}</h3>
                        <p>{report.description}</p>
                        <p>
                          <strong>Risk Level: </strong>
                          <span className={`risk-level ${report.riskLevel}`}>
                            {report.riskLevel.toUpperCase()}
                          </span>
                        </p>
                        <p>
                          <strong>Reported: </strong>
                          {new Date(report.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[report.location.lat, report.location.lng]}
                    radius={20000} // 20km radius
                    pathOptions={{
                      color: getRiskColor(report.riskLevel),
                      fillColor: getRiskColor(report.riskLevel),
                      fillOpacity: 0.2
                    }}
                  />
                </React.Fragment>
              ))}
            </MapContainer>
          )}
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="recent-alerts-section">
        <div className="section-header">
          <h2>Recent Alerts</h2>
          <Link to="/alerts" className="view-all">View All</Link>
        </div>
        <div className="alerts-container">
          {loading ? (
            <p>Loading alerts...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <div className="alerts-list">
              {alerts.length === 0 ? (
                <p>No alerts at this time.</p>
              ) : (
                alerts
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map(alert => (
                    <div 
                      key={alert.id} 
                      className={`alert-item ${alert.riskLevel}`}
                    >
                      <h3>{alert.title}</h3>
                      <p>{alert.description}</p>
                      <p>
                        <strong>Area: </strong>
                        {alert.area}
                      </p>
                      <div className="alert-meta">
                        <span className={`alert-risk ${alert.riskLevel}`}>
                          {alert.riskLevel.toUpperCase()}
                        </span>
                        <span className="alert-time">
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Resources Section */}
      <section id="resources" className="resources-section">
        <h2>Flood Safety Resources</h2>
        <div className="resources-grid">
          <div className="resource-card">
            <h3>Before a Flood</h3>
            <ul>
              <li>Create an emergency plan</li>
              <li>Prepare an emergency kit</li>
              <li>Know your evacuation routes</li>
              <li>Store important documents in a waterproof container</li>
            </ul>
          </div>
          <div className="resource-card">
            <h3>During a Flood</h3>
            <ul>
              <li>Move to higher ground immediately</li>
              <li>Do not walk or drive through flood waters</li>
              <li>Stay away from bridges over fast-moving water</li>
              <li>Evacuate if told to do so</li>
            </ul>
          </div>
          <div className="resource-card">
            <h3>After a Flood</h3>
            <ul>
              <li>Return home only when authorities say it's safe</li>
              <li>Be aware of areas where floodwaters have receded</li>
              <li>Clean and disinfect everything that got wet</li>
              <li>Document damage for insurance purposes</li>
            </ul>
          </div>
          <div className="resource-card">
            <h3>Emergency Contacts</h3>
            <ul>
              <li>Emergency Services: 112</li>
              <li>National Emergency Response Center: 1078</li>
              <li>Disaster Management Helpline: 108</li>
              <li>State Emergency Operation Center: Check local listings</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 