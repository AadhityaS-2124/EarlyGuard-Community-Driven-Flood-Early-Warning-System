import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Set a timeout to prevent indefinite hanging
  timeout: 10000,
});

export interface ReportData {
  type: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  image?: File;
  waterLevel?: string;
  impactDetails?: {
    roadsAffected: boolean;
    housesAffected: boolean;
    infrastructureDamage: boolean;
  };
  urgencyLevel?: string;
  contactInfo?: {
    name: string;
    phone: string;
    email: string;
  };
  additionalObservations?: string;
}

export interface Report {
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
  waterLevel?: string;
  impactDetails?: {
    roadsAffected: boolean;
    housesAffected: boolean;
    infrastructureDamage: boolean;
  };
  urgencyLevel?: string;
}

export interface Alert {
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

// Mock data for development when the backend is not available
const mockReports: Report[] = [
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

const mockAlerts: Alert[] = [
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

// Get all reports
export const getReports = async (): Promise<Report[]> => {
  try {
    console.log('Fetching reports from:', `${API_URL}/reports`);
    const response = await api.get('/reports');
    console.log('Reports response:', response.data);
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, returning fallback demo reports:', error);
    return [...mockReports];
  }
};

// Submit a new report
export const submitReport = async (reportData: ReportData): Promise<Report> => {
  try {
    console.log('Submitting report to:', `${API_URL}/reports`);
    console.log('Report data:', reportData);
    
    // If there's an image, use FormData
    if (reportData.image) {
      const formData = new FormData();
      formData.append('type', reportData.type);
      formData.append('description', reportData.description);
      formData.append('location', JSON.stringify(reportData.location));
      formData.append('image', reportData.image);
      
      if (reportData.waterLevel) {
        formData.append('waterLevel', reportData.waterLevel);
      }
      
      if (reportData.impactDetails) {
        formData.append('impactDetails', JSON.stringify(reportData.impactDetails));
      }
      
      if (reportData.urgencyLevel) {
        formData.append('urgencyLevel', reportData.urgencyLevel);
      }
      
      if (reportData.contactInfo) {
        formData.append('contactInfo', JSON.stringify(reportData.contactInfo));
      }
      
      if (reportData.additionalObservations) {
        formData.append('additionalObservations', reportData.additionalObservations);
      }
      
      const response = await api.post('/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Otherwise, send JSON
      const response = await api.post('/reports', reportData);
      return response.data;
    }
  } catch (error) {
    console.warn('Backend unavailable, saving report to in-memory demo state:', error);
    
    // Determine risk level based on input data
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (reportData.urgencyLevel === 'high' || reportData.waterLevel === 'Severe' || reportData.waterLevel === 'Significant') {
      riskLevel = 'high';
    } else if (reportData.urgencyLevel === 'medium' || reportData.waterLevel === 'Moderate') {
      riskLevel = 'medium';
    }
    
    const id = Date.now().toString();
    const mockReport: Report = {
      id,
      type: reportData.type,
      description: reportData.description,
      location: reportData.location,
      timestamp: Date.now(),
      riskLevel,
      verified: false,
      waterLevel: reportData.waterLevel,
      impactDetails: reportData.impactDetails,
      urgencyLevel: reportData.urgencyLevel
    };
    
    // Save to in-memory array
    mockReports.unshift(mockReport);
    
    // Also create an alert if medium or high risk
    if (riskLevel === 'medium' || riskLevel === 'high') {
      let alertDescription = reportData.waterLevel ? `${reportData.waterLevel} water level: ${reportData.description}` : reportData.description;
      const newAlert: Alert = {
        id: `alert-${id}`,
        title: `${reportData.type} Alert`,
        description: alertDescription,
        area: `Location: ${reportData.location.lat.toFixed(4)}, ${reportData.location.lng.toFixed(4)}`,
        timestamp: Date.now(),
        riskLevel,
        source: 'community',
        urgencyLevel: reportData.urgencyLevel,
        waterLevel: reportData.waterLevel
      };
      mockAlerts.unshift(newAlert);
    }
    
    return mockReport;
  }
};

// Get all alerts
export const getAlerts = async (): Promise<Alert[]> => {
  try {
    console.log('Fetching alerts from:', `${API_URL}/alerts`);
    const response = await api.get('/alerts');
    console.log('Alerts response:', response.data);
    return response.data;
  } catch (error) {
    console.warn('Backend unavailable, returning fallback demo alerts:', error);
    return [...mockAlerts];
  }
};

export default api; 