import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { submitReport } from '../services/api';

interface ReportFormData {
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  image?: File | null;
  waterLevel: string;
  impactDetails: {
    roadsAffected: boolean;
    housesAffected: boolean;
    infrastructureDamage: boolean;
  };
  urgencyLevel: string;
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  additionalObservations: string;
}

const LocationMarker: React.FC<{
  position: [number, number];
  setPosition: (position: [number, number]) => void;
}> = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : null;
};

// Confirmation Modal Component
interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  formData: ReportFormData;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, onClose, onConfirm, formData }) => {
  if (!show) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Confirm Report Submission</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <h3>Report Summary</h3>
          
          <div className="summary-section">
            <h4>Incident Details</h4>
            <p><strong>Type:</strong> {formData.type}</p>
            <p><strong>Water Level:</strong> {formData.waterLevel}</p>
            <p><strong>Urgency:</strong> {formData.urgencyLevel}</p>
          </div>
          
          <div className="summary-section">
            <h4>Location</h4>
            <p>
              Latitude: {formData.location.lat.toFixed(6)}, 
              Longitude: {formData.location.lng.toFixed(6)}
            </p>
          </div>
          
          <div className="summary-section">
            <h4>Areas Affected</h4>
            <ul>
              {formData.impactDetails.roadsAffected && <li>Roads/streets affected</li>}
              {formData.impactDetails.housesAffected && <li>Houses/buildings affected</li>}
              {formData.impactDetails.infrastructureDamage && <li>Infrastructure damage</li>}
              {!formData.impactDetails.roadsAffected && 
               !formData.impactDetails.housesAffected && 
               !formData.impactDetails.infrastructureDamage && <li>None specified</li>}
            </ul>
          </div>
          
          <div className="summary-section">
            <h4>Description</h4>
            <p>{formData.description}</p>
          </div>
          
          {formData.additionalObservations && (
            <div className="summary-section">
              <h4>Additional Observations</h4>
              <p>{formData.additionalObservations}</p>
            </div>
          )}
          
          {(formData.contactInfo.name || formData.contactInfo.phone || formData.contactInfo.email) && (
            <div className="summary-section">
              <h4>Contact Information</h4>
              {formData.contactInfo.name && <p><strong>Name:</strong> {formData.contactInfo.name}</p>}
              {formData.contactInfo.phone && <p><strong>Phone:</strong> {formData.contactInfo.phone}</p>}
              {formData.contactInfo.email && <p><strong>Email:</strong> {formData.contactInfo.email}</p>}
            </div>
          )}
          
          {formData.image && (
            <div className="summary-section">
              <h4>Image</h4>
              <p>Image will be uploaded with your report</p>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Edit Report</button>
          <button className="btn btn-primary" onClick={onConfirm}>Submit Report</button>
        </div>
      </div>
    </div>
  );
};

const ReportForm: React.FC = () => {
  const [formData, setFormData] = useState<ReportFormData>({
    type: '',
    description: '',
    location: { lat: 0, lng: 0 },
    image: null,
    waterLevel: '',
    impactDetails: {
      roadsAffected: false,
      housesAffected: false,
      infrastructureDamage: false,
    },
    urgencyLevel: 'medium',
    contactInfo: {
      name: '',
      phone: '',
      email: '',
    },
    additionalObservations: '',
  });

  const [position, setPosition] = useState<[number, number] | null>([20.5937, 78.9629]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([20.5937, 78.9629]); // Default to center of India
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [lastSubmittedRisk, setLastSubmittedRisk] = useState<string>('low');

  useEffect(() => {
    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setPosition([latitude, longitude]);
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude }
          }));
        },
        (error) => {
          console.warn("Error getting location, using default center:", error);
          setPosition([20.5937, 78.9629]);
        }
      );
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parentProp, childProp] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parentProp]: {
          ...(prev[parentProp as keyof typeof prev] as Record<string, unknown>),
          [childProp]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    const [parentProp, childProp] = name.split('.');
    
    setFormData(prev => ({
      ...prev,
      [parentProp]: {
        ...(prev[parentProp as keyof typeof prev] as Record<string, unknown>),
        [childProp]: checked
      }
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files ? e.target.files[0] : null
      }));
    }
  };

  const handlePositionChange = (newPosition: [number, number]) => {
    setPosition(newPosition);
    setFormData(prev => ({
      ...prev,
      location: { lat: newPosition[0], lng: newPosition[1] }
    }));
  };

  const handlePreviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Show confirmation modal
    setShowConfirmation(true);
  };
  
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setShowConfirmation(false);

    try {
      // Use the submitReport function from api.ts
      const reportData = {
        type: formData.type,
        description: formData.description,
        location: formData.location,
        waterLevel: formData.waterLevel,
        impactDetails: formData.impactDetails,
        urgencyLevel: formData.urgencyLevel,
        contactInfo: formData.contactInfo,
        additionalObservations: formData.additionalObservations,
        image: formData.image || undefined
      };
      
      const response = await submitReport(reportData);
      console.log('Report submitted successfully:', response);
      setLastSubmittedRisk(response.riskLevel || formData.urgencyLevel || 'medium');
      
      // Reset form after successful submission
      setFormData({
        type: '',
        description: '',
        location: formData.location, // Keep the location
        image: null,
        waterLevel: '',
        impactDetails: {
          roadsAffected: false,
          housesAffected: false,
          infrastructureDamage: false,
        },
        urgencyLevel: 'medium',
        contactInfo: {
          name: '',
          phone: '',
          email: '',
        },
        additionalObservations: '',
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000); // Clear success message after 5 seconds
    } catch (err) {
      setError('Failed to submit report. Please try again.');
      console.error('Error submitting form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-form-page">
      <h1>Report an Incident</h1>
      <p className="form-intro">
        Report rising water levels, overflowing drains, or any early signs of flooding in your area.
        Your reports help us provide timely alerts to your community.
      </p>
      
      {success && (
        <div className="alert-success">
          Report submitted successfully! Thank you for contributing to community safety.
          {(lastSubmittedRisk === 'high' || lastSubmittedRisk === 'medium') && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.75)', borderRadius: '4px', borderLeft: '3px solid #1a73e8', color: '#1e293b' }}>
              <strong>📢 Emergency Automation Paired & Active:</strong> {lastSubmittedRisk.toUpperCase()} risk flood alert verified! Automated announcement broadcasts dispatched directly to registered Mail IDs across affected Indian flood zones.
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}
      
      <div className="form-container">
        <form onSubmit={handlePreviewSubmit}>
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label htmlFor="type">Incident Type</label>
              <select 
                id="type" 
                name="type" 
                className="form-control"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="">Select incident type</option>
                <option value="Rising Water">Rising Water</option>
                <option value="Overflowing Drain">Overflowing Drain</option>
                <option value="Heavy Rainfall">Heavy Rainfall</option>
                <option value="Infrastructure Damage">Infrastructure Damage</option>
                <option value="Flash Flood">Flash Flood</option>
                <option value="Landslide Risk">Landslide Risk</option>
                <option value="Other">Other</option>
              </select>
            </div>
          
            <div className="form-group">
              <label htmlFor="waterLevel">Water Level</label>
              <select 
                id="waterLevel" 
                name="waterLevel" 
                className="form-control"
                value={formData.waterLevel}
                onChange={handleInputChange}
                required
              >
                <option value="">Select water level</option>
                <option value="None">None - No visible water accumulation</option>
                <option value="Minor">Minor - Small puddles, less than ankle height</option>
                <option value="Moderate">Moderate - Ankle to knee height</option>
                <option value="Significant">Significant - Knee to waist height</option>
                <option value="Severe">Severe - Above waist height</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="urgencyLevel">Urgency Level</label>
              <select 
                id="urgencyLevel" 
                name="urgencyLevel" 
                className="form-control"
                value={formData.urgencyLevel}
                onChange={handleInputChange}
                required
              >
                <option value="low">Low - Situation developing slowly</option>
                <option value="medium">Medium - Situation requires attention</option>
                <option value="high">High - Immediate action required</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Location Details</h3>
            <div className="form-group">
              <label>Location</label>
              <p className="form-help">Click on the map to set the incident location</p>
              <div className="map-container" style={{ height: '300px' }}>
                <MapContainer 
                  center={userLocation} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <LocationMarker 
                    position={position || userLocation} 
                    setPosition={handlePositionChange} 
                  />
                </MapContainer>
              </div>
              {position && (
                <p className="location-display">
                  Selected location: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </p>
              )}
            </div>
          </div>
          
          <div className="form-section">
            <h3>Impact Assessment</h3>
            <div className="form-group checkbox-group">
              <label>Areas Affected</label>
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="roadsAffected" 
                  name="impactDetails.roadsAffected" 
                  checked={formData.impactDetails.roadsAffected}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="roadsAffected">Roads or streets affected</label>
              </div>
              
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="housesAffected" 
                  name="impactDetails.housesAffected" 
                  checked={formData.impactDetails.housesAffected}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="housesAffected">Houses or buildings affected</label>
              </div>
              
              <div className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="infrastructureDamage" 
                  name="impactDetails.infrastructureDamage" 
                  checked={formData.impactDetails.infrastructureDamage}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="infrastructureDamage">Infrastructure damage (bridges, power lines, etc.)</label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Detailed Description</label>
              <textarea 
                id="description" 
                name="description" 
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Please provide details about the incident..."
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="additionalObservations">Additional Observations</label>
              <textarea 
                id="additionalObservations" 
                name="additionalObservations" 
                className="form-control"
                value={formData.additionalObservations}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any other observations that might be relevant (optional)"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="image">Upload Image (Optional)</label>
              <input 
                type="file" 
                id="image" 
                name="image" 
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              <p className="form-help">Images help us verify reports and assess the situation more accurately.</p>
            </div>
          </div>
          
          <div className="form-section">
            <h3>Contact Information (Optional)</h3>
            <p className="form-help">Your contact information will only be used to follow up on this report if necessary.</p>
            
            <div className="form-group">
              <label htmlFor="contactName">Name</label>
              <input 
                type="text" 
                id="contactName" 
                name="contactInfo.name" 
                className="form-control"
                value={formData.contactInfo.name}
                onChange={handleInputChange}
                placeholder="Your name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="contactEmail">Mail ID (Email Address)</label>
              <input 
                type="email" 
                id="contactEmail" 
                name="contactInfo.email" 
                className="form-control"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                placeholder="Your Mail ID (e.g. name@gmail.com)"
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting || !formData.type || !formData.description || !position || !formData.waterLevel}
            >
              {submitting ? 'Submitting...' : 'Preview & Submit Report'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        show={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
      />
    </div>
  );
};

export default ReportForm; 