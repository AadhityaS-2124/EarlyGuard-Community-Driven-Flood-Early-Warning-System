import React, { useState, useEffect } from 'react';
import PhoneRegistration from './PhoneRegistration';
import { getAlerts } from '../services/api';

interface Alert {
  id: string;
  title: string;
  description: string;
  area: string;
  timestamp: number;
  riskLevel: 'low' | 'medium' | 'high';
  source: 'system' | 'community' | 'authority';
  urgencyLevel?: string;
  waterLevel?: string;
  impactDetails?: {
    roadsAffected?: boolean;
    housesAffected?: boolean;
    infrastructureDamage?: boolean;
  };
}

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [seenAlerts, setSeenAlerts] = useState<string[]>([]);
  const [sharedAlerts, setSharedAlerts] = useState<string[]>([]);

  const handleMarkSeen = (id: string) => {
    if (!seenAlerts.includes(id)) {
      setSeenAlerts([...seenAlerts, id]);
    }
  };

  const handleShare = async (alert: Alert) => {
    const text = `${alert.title}: ${alert.description} (${alert.area})`;
    if (navigator.share) {
      try {
        await navigator.share({ title: alert.title, text, url: window.location.href });
      } catch (e) {
        console.log('Share canceled or failed', e);
      }
    } else {
      navigator.clipboard?.writeText(text);
      setSharedAlerts([...sharedAlerts, alert.id]);
      setTimeout(() => {
        setSharedAlerts(prev => prev.filter(id => id !== alert.id));
      }, 2000);
    }
  };
  
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        setLoading(true);
        const fetchedAlerts = await getAlerts();
        setAlerts(fetchedAlerts);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch alerts. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchAlerts();
  }, []);
  
  const filteredAlerts = filter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.riskLevel === filter);
  
  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'system':
        return 'System Generated';
      case 'community':
        return 'Community Report';
      case 'authority':
        return 'Official Authority';
      default:
        return 'Unknown';
    }
  };

  const getUrgencyLabel = (urgency: string = 'medium') => {
    switch (urgency) {
      case 'high':
        return 'Immediate Action Required';
      case 'medium':
        return 'Requires Attention';
      case 'low':
        return 'Monitor Situation';
      default:
        return 'Not Specified';
    }
  };
  
  const getImpactDetails = (alert: Alert) => {
    if (!alert.impactDetails) return null;
    
    const impacts = [];
    if (alert.impactDetails.roadsAffected) impacts.push('Roads/Streets');
    if (alert.impactDetails.housesAffected) impacts.push('Houses/Buildings');
    if (alert.impactDetails.infrastructureDamage) impacts.push('Critical Infrastructure');
    
    if (impacts.length === 0) return null;
    
    return (
      <p><strong>Areas Affected:</strong> {impacts.join(', ')}</p>
    );
  };
  
  return (
    <div className="alerts-page">
      <div className="alerts-header">
        <div className="alerts-title">
          <h1>Flood Alerts</h1>
          <p className="alerts-intro">
            Stay informed about flood risks in your area. These alerts are generated from community reports, 
            weather data, and official announcements.
          </p>
        </div>
        
        <div className="notification-settings">
          <PhoneRegistration />
        </div>
      </div>
      
      <div className="filters">
        <span>Filter by risk level: </span>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'low' ? 'active' : ''}`}
            onClick={() => setFilter('low')}
          >
            Low
          </button>
          <button 
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Medium
          </button>
          <button 
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High
          </button>
        </div>
      </div>
      
      <div className="alerts-list-container">
        {loading ? (
          <p>Loading alerts...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <>
            <p className="alerts-count">
              Showing {filteredAlerts.length} {filter !== 'all' ? filter + ' risk' : ''} alerts
            </p>
            
            {filteredAlerts.length === 0 ? (
              <p>No alerts match your filter criteria.</p>
            ) : (
              <div className="alerts-list">
                {filteredAlerts
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map(alert => (
                    <div 
                      key={alert.id} 
                      className={`alert-card ${alert.riskLevel}`}
                    >
                      <div className="alert-header">
                        <h2>{alert.title}</h2>
                        <div className="alert-badges">
                          <span className={`risk-level ${alert.riskLevel}`}>
                            {alert.riskLevel.toUpperCase()} RISK
                          </span>
                          {alert.urgencyLevel && (
                            <span className={`urgency-level ${alert.urgencyLevel}`}>
                              {getUrgencyLabel(alert.urgencyLevel)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="alert-description">{alert.description}</p>
                      
                      <div className="alert-meta">
                        <p><strong>Area:</strong> {alert.area}</p>
                        {alert.waterLevel && (
                          <p><strong>Water Level:</strong> {alert.waterLevel}</p>
                        )}
                        {getImpactDetails(alert)}
                        <p><strong>Source:</strong> {getSourceLabel(alert.source)}</p>
                        <p><strong>Issued:</strong> {new Date(alert.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <div className="alert-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleShare(alert)}
                        >
                          {sharedAlerts.includes(alert.id) ? '✓ Copied to Clipboard' : 'Share Alert'}
                        </button>
                        <button 
                          className={`btn ${seenAlerts.includes(alert.id) ? 'seen' : ''}`}
                          onClick={() => handleMarkSeen(alert.id)}
                          disabled={seenAlerts.includes(alert.id)}
                          style={seenAlerts.includes(alert.id) ? { opacity: 0.6, cursor: 'default' } : {}}
                        >
                          {seenAlerts.includes(alert.id) ? '✓ Marked as Seen' : 'Mark as Seen'}
                        </button>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AlertsPage; 