import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getReports } from '../services/api';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

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

const Dashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Default center of the map (can be set to user's location or a default location)
  const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // Center of India
  
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        const data = await getReports();
        setReports(data as any);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reports. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchReportsData();
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
  
  return (
    <div className="dashboard">
      <div className="map-section">
        <h2>Flood Risk Map</h2>
        <div className="map-container">
          <MapContainer 
            center={defaultCenter} 
            zoom={5} 
            style={{ height: '100%', width: '100%' }}
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
                      <p>
                        <strong>Status: </strong>
                        {report.verified ? 'Verified' : 'Unverified'}
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
        </div>
      </div>
      
      <div className="alerts-container">
        <h2>Recent Alerts</h2>
        {loading ? (
          <p>Loading alerts...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="alerts-list">
            {reports.length === 0 ? (
              <p>No alerts at this time.</p>
            ) : (
              reports
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(report => (
                  <div 
                    key={report.id} 
                    className={`alert-item ${report.riskLevel}`}
                  >
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
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 