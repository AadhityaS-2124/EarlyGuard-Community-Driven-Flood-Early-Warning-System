import React, { useState } from 'react';
import { registerPhoneNumber } from '../services/notification';
import { isValidEmail } from '../services/auth';

const PhoneRegistration: React.FC = () => {
  const [contactEmail, setContactEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate Mail ID (Email validation)
      if (!contactEmail || !isValidEmail(contactEmail)) {
        throw new Error('Please enter a valid Mail ID address');
      }
      
      const result = await registerPhoneNumber(contactEmail);
      
      if (result) {
        setSuccess(true);
        setContactEmail('');
        setTimeout(() => setSuccess(false), 5000); // Clear success message after 5 seconds
      } else {
        throw new Error('Failed to register Mail ID');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="phone-registration">
      <h3>Register Contact for Emergency Alerts</h3>
      <p className="registration-info">
        Get critical flood announcements and early warnings directly to your Mail ID. We only dispatch broadcasts for high-risk Indian flood zones.
      </p>
      
      {success && (
        <div className="alert-success">
          Mail ID registered successfully! You will now receive emergency email broadcasts.
        </div>
      )}
      
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="contactEmail">Mail ID (Email Address)</label>
          <input
            type="email"
            id="contactEmail"
            className="form-control"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Enter your Mail ID (e.g., name@gmail.com)"
            required
          />
          <small className="form-help">
            Format: Valid Mail ID address (Gmail, iCloud, Yahoo, etc.)
          </small>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={isSubmitting || !contactEmail}
        >
          {isSubmitting ? 'Registering...' : 'Register Contact'}
        </button>
      </form>
    </div>
  );
};

export default PhoneRegistration; 