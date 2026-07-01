const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock database (in a real app, this would be a proper database)
let reports = [];
let alerts = [];
let fcmTokens = []; // Store FCM tokens for push notifications
let phoneNumbers = []; // Store Mail ids for Mail alerts

// Routes
app.get('/api/reports', (req, res) => {
  console.log('GET /api/reports - Returning reports:', reports.length);
  res.json(reports);
});

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

app.post('/api/reports', async (req, res) => {
  try {
    console.log('POST /api/reports - Received report submission');
    console.log('Request body:', req.body);
    
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
    
    // Parse the location if it's a string
    let locationObj = location;
    if (typeof location === 'string') {
      try {
        locationObj = JSON.parse(location);
      } catch (e) {
        console.error('Error parsing location:', e);
        return res.status(400).json({ error: 'Invalid location format' });
      }
    }
    
    // Parse impactDetails if it's a string
    let impactDetailsObj = impactDetails;
    if (typeof impactDetails === 'string') {
      try {
        impactDetailsObj = JSON.parse(impactDetails);
      } catch (e) {
        console.error('Error parsing impactDetails:', e);
        return res.status(400).json({ error: 'Invalid impactDetails format' });
      }
    }
    
    // Parse contactInfo if it's a string
    let contactInfoObj = contactInfo;
    if (typeof contactInfo === 'string') {
      try {
        contactInfoObj = JSON.parse(contactInfo);
      } catch (e) {
        console.error('Error parsing contactInfo:', e);
        return res.status(400).json({ error: 'Invalid contactInfo format' });
      }
    }
    
    if (!type || !description || !locationObj || !waterLevel) {
      console.error('Missing required fields');
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Generate a unique ID
    const id = Date.now().toString();
    
    // In a real app, we would validate the report with weather data
    // For example, checking rainfall data from OpenWeatherMap
    let riskLevel = 'low';
    
    try {
      // This would be your actual OpenWeatherMap API key
      const apiKey = process.env.OPENWEATHER_API_KEY || 'your_api_key_here';
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${locationObj.lat}&lon=${locationObj.lng}&appid=${apiKey}`
      );
      
      // Simple algorithm to determine risk level based on weather conditions
      if (weatherResponse.data.weather) {
        const weatherId = weatherResponse.data.weather[0].id;
        const rainVolume = weatherResponse.data.rain ? weatherResponse.data.rain['1h'] || 0 : 0;
        
        if (weatherId >= 200 && weatherId < 300) {
          // Thunderstorm
          riskLevel = 'high';
        } else if (weatherId >= 300 && weatherId < 400) {
          // Drizzle
          riskLevel = 'low';
        } else if (weatherId >= 500 && weatherId < 600) {
          // Rain
          if (rainVolume > 10) {
            riskLevel = 'high';
          } else if (rainVolume > 5) {
            riskLevel = 'medium';
          } else {
            riskLevel = 'low';
          }
        } else if (weatherId >= 600 && weatherId < 700) {
          // Snow - can cause rapid melting and flooding
          riskLevel = 'medium';
        }
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // If weather API fails, use urgency level and water level to determine risk
      if (urgencyLevel === 'high' || waterLevel === 'Severe' || waterLevel === 'Significant') {
        riskLevel = 'high';
      } else if (urgencyLevel === 'medium' || waterLevel === 'Moderate') {
        riskLevel = 'medium';
      } else {
        riskLevel = 'low';
      }
    }
    
    // Further adjust risk level based on impact details and water level
    if (impactDetailsObj) {
      // If multiple impact types or severe water level, increase risk
      const impactCount = Object.values(impactDetailsObj).filter(Boolean).length;
      
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
      location: locationObj,
      waterLevel,
      impactDetails: impactDetailsObj || {},
      urgencyLevel: urgencyLevel || 'medium',
      contactInfo: contactInfoObj || {},
      additionalObservations: additionalObservations || '',
      timestamp: Date.now(),
      riskLevel,
      verified: false
    };
    
    console.log('Created report:', newReport);
    
    // Save the report
    reports.push(newReport);
    
    // In a real app, we would save to Firebase here
    // db.ref('reports').push(newReport);
    
    // ALWAYS create an alert for the report to ensure it displays in alerts page
    // Construct a more detailed alert message based on the enhanced data
    let alertTitle = `${type} Alert`;
    let alertDescription = description;
    
    // Add water level information to the alert
    if (waterLevel) {
      alertDescription = `${waterLevel} water level: ${description}`;
    }
    
    // Add impact information if available
    let impactText = '';
    if (impactDetailsObj) {
      const impacts = [];
      if (impactDetailsObj.roadsAffected) impacts.push('roads');
      if (impactDetailsObj.housesAffected) impacts.push('buildings');
      if (impactDetailsObj.infrastructureDamage) impacts.push('infrastructure');
      
      if (impacts.length > 0) {
        impactText = ` Affecting: ${impacts.join(', ')}.`;
      }
    }
    
    // Get an approximate area name from the coordinates
    let area = 'Area determined by coordinates';
    try {
      // This is a simplified example - in a real app we would use reverse geocoding
      area = `Location: ${locationObj.lat.toFixed(4)}, ${locationObj.lng.toFixed(4)}`;
    } catch (e) {
      console.error('Error determining area:', e);
    }
    
    const newAlert = {
      id: `alert-${id}`,
      title: alertTitle,
      description: alertDescription + impactText,
      area: area,
      timestamp: Date.now(),
      riskLevel,
      urgencyLevel: urgencyLevel || 'medium',
      source: 'community',
      waterLevel,
      impactDetails: impactDetailsObj
    };
    
    console.log('Created alert from report:', newAlert);
    
    alerts.push(newAlert);
    
    // In a real app, we would save to Firebase here
    // db.ref('alerts').push(newAlert);
    
    // Send push notifications if FCM tokens are available
    if (fcmTokens.length > 0) {
      try {
        // Commented out actual Firebase call
        // await sendMulticastNotification(
        //  fcmTokens,
        //  newAlert.title,
        //  newAlert.description,
        //  { alertId: newAlert.id, riskLevel }
        // );
        console.log(`Would send push notifications to ${fcmTokens.length} devices`);
      } catch (error) {
        console.error('Error sending push notifications:', error);
      }
    }
    
    // Send Mail if Mail ids are available and risk level is high
    if (phoneNumbers.length > 0 && riskLevel === 'high') {
      try {
        // Commented out actual Twilio call
        // await sendBulkMail(
        //  phoneNumbers,
        //  `ALERT: ${newAlert.title} - ${newAlert.description}. Risk Level: ${riskLevel.toUpperCase()}`
        // );
        console.log(`Would send Mail alerts to ${phoneNumbers.length} numbers`);
      } catch (error) {
        console.error('Error sending Mail alerts:', error);
      }
    }
    
    res.status(201).json(newReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/alerts', (req, res) => {
  console.log('GET /api/alerts - Returning alerts:', alerts.length);
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
    },
    {
      id: '3',
      type: 'Heavy Rainfall',
      description: 'Continuous heavy rainfall for past 3 hours',
      location: { lat: 12.9716, lng: 77.5946 },
      timestamp: Date.now() - 10800000, // 3 hours ago
      riskLevel: 'low',
      verified: false
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
    },
    {
      id: '3',
      title: 'Local Drain Overflow',
      description: 'Multiple reports of drain overflow near Koramangala area.',
      area: 'Bangalore, Karnataka',
      timestamp: Date.now() - 10800000, // 3 hours ago
      riskLevel: 'low',
      source: 'community'
    }
  ];
}

initMockData(); 