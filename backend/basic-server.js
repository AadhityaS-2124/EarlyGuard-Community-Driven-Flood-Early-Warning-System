const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
// Use port 3001 as default, or try another port if that one is taken
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory database
let reports = [];
let alerts = [];
let fcmTokens = [];
let phoneNumbers = [];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Routes
app.get('/api/reports', (req, res) => {
  res.json(reports);
});

app.post('/api/reports', async (req, res) => {
  try {
    const { 
      type, 
      description, 
      location, 
      waterLevel,
      impactDetails,
      urgencyLevel,
      contactInfo,
      additionalObservations 
    } = req.body;
    
    if (!type || !description || !location || !waterLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate a unique ID
    const id = Date.now().toString();
    
    // Determine risk level based on input data
    let riskLevel = 'low';
    if (urgencyLevel === 'high' || waterLevel === 'Severe' || waterLevel === 'Significant') {
      riskLevel = 'high';
    } else if (urgencyLevel === 'medium' || waterLevel === 'Moderate') {
      riskLevel = 'medium';
    }
    
    // Further adjust risk level based on impact details
    if (impactDetails) {
      const impactCount = Object.values(impactDetails).filter(Boolean).length;
      if (impactCount >= 2 || waterLevel === 'Severe') {
        riskLevel = 'high';
      } else if (impactCount === 1 && riskLevel === 'low' && waterLevel !== 'None' && waterLevel !== 'Minor') {
        riskLevel = 'medium';
      }
    }
    
    // Create the report
    const newReport = {
      id,
      type,
      description,
      location,
      waterLevel,
      impactDetails: impactDetails || {},
      urgencyLevel: urgencyLevel || 'medium',
      contactInfo: contactInfo || {},
      additionalObservations: additionalObservations || '',
      timestamp: Date.now(),
      riskLevel,
      verified: false
    };
    
    // Save the report
    reports.push(newReport);
    
    // Generate an alert if risk level is medium or high
    if (riskLevel === 'medium' || riskLevel === 'high') {
      let alertTitle = `${type} Alert`;
      let alertDescription = description;
      
      // Add water level information to the alert
      if (waterLevel) {
        alertDescription = `${waterLevel} water level: ${description}`;
      }
      
      // Add impact information if available
      let impactText = '';
      if (impactDetails) {
        const impacts = [];
        if (impactDetails.roadsAffected) impacts.push('roads');
        if (impactDetails.housesAffected) impacts.push('buildings');
        if (impactDetails.infrastructureDamage) impacts.push('infrastructure');
        
        if (impacts.length > 0) {
          impactText = ` Affecting: ${impacts.join(', ')}.`;
        }
      }
      
      const newAlert = {
        id: `alert-${id}`,
        title: alertTitle,
        description: alertDescription + impactText,
        area: 'Area determined by coordinates',
        timestamp: Date.now(),
        riskLevel,
        urgencyLevel: urgencyLevel || 'medium',
        source: 'community'
      };
      
      alerts.push(newAlert);
      
      // Log that we would send notifications and Mail in a real app
      if (fcmTokens.length > 0) {
        console.log(`Would send push notifications to ${fcmTokens.length} devices`);
      }
      
      if (phoneNumbers.length > 0 && riskLevel === 'high') {
        console.log(`Would send Mail alerts to ${phoneNumbers.length} numbers`);
      }
    }
    
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts);
});

// Register FCM token for push notifications
app.post('/api/register-token', (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  // Add token if it doesn't exist
  if (!fcmTokens.includes(token)) {
    fcmTokens.push(token);
    console.log('FCM token registered:', token);
  }
  
  res.status(200).json({ success: true });
});

// Register Mail id for Mail alerts
app.post('/api/register-phone', (req, res) => {
  const { phoneNumber } = req.body;
  
  if (!phoneNumber) {
    return res.status(400).json({ error: 'Mail id is required' });
  }
  
  // Add Mail id if it doesn't exist
  if (!phoneNumbers.includes(phoneNumber)) {
    phoneNumbers.push(phoneNumber);
    console.log('Mail id registered:', phoneNumber);
  }
  
  res.status(200).json({ success: true });
});

// Modified server start logic with port availability checking
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is already in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

// Start the server with port availability check
startServer(PORT);

// Initialize with some mock data
function initMockData() {
  reports = [
    {
      id: '1',
      type: 'Rising Water',
      description: 'Water level rising rapidly in Yamuna river',
      location: { lat: 28.7041, lng: 77.1025 },
      timestamp: Date.now() - 3600000, // 1 hour ago
      riskLevel: 'high',
      verified: true
    },
    {
      id: '2',
      type: 'Overflowing Drain',
      description: 'Drain overflowing near residential area',
      location: { lat: 19.0760, lng: 72.8777 },
      timestamp: Date.now() - 7200000, // 2 hours ago
      riskLevel: 'medium',
      verified: true
    }
  ];
  
  alerts = [
    {
      id: '1',
      title: 'Severe Flood Warning',
      description: 'Yamuna river has crossed danger level. Immediate evacuation advised for low-lying areas.',
      area: 'East Delhi, Delhi',
      timestamp: Date.now() - 3600000, // 1 hour ago
      riskLevel: 'high',
      source: 'authority'
    },
    {
      id: '2',
      title: 'Rising Water Levels',
      description: 'Water levels in Mithi River rising rapidly due to continuous rainfall.',
      area: 'Mumbai, Maharashtra',
      timestamp: Date.now() - 7200000, // 2 hours ago
      riskLevel: 'medium',
      source: 'system'
    }
  ];
}

initMockData();

console.log(`Starting EarlyGuard server with port availability check...`); 