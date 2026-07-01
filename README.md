# EarlyGuard: Community-Driven Flood Early Warning System

EarlyGuard is a community-powered flood early warning platform that bridges the gap between centralized weather data and on-the-ground realities. It enables citizens to report early signs of flooding, which are then validated with real-time weather data to generate localized alerts.

## Features

- **Community Reporting**: Users can report rising water levels, overflowing drains, or early signs of flooding through a simple geo-tagged interface
- **Data Validation**: Reports are cross-validated using real-time weather data via OpenWeatherMap API
- **Real-time Alerts**: The system triggers localized alerts using push notifications and Mail for wider accessibility
- **Risk Visualization**: A real-time dashboard visualizes risk levels and citizen reports on a map
- **Multi-channel Alerts**: Reach users through web, mobile, and Mail channels

## Tech Stack

### Frontend
- React.js with TypeScript
- Leaflet.js for map visualization
- Responsive design for both desktop and mobile

### Backend
- Node.js with Express
- Firebase Realtime Database for storing incident reports
- OpenWeatherMap API for weather data validation
- Twilio Mail API for alerts in low-network areas

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/earlyguard.git
cd earlyguard
```

2. Install frontend dependencies
```
cd frontend
npm install
```

3. Install backend dependencies
```
cd ../backend
npm install
```

4. Set up environment variables
   - Create a `.env` file in the backend directory
   - Add your API keys for OpenWeatherMap, Twilio, and Firebase

5. Start the backend server
```
npm start
```

6. Start the frontend development server
```
cd ../frontend
npm start
```

7. Open your browser and navigate to `http://localhost:3000`

## Future Enhancements

- Machine learning for improved risk prediction based on historical data
- Integration with IoT water level sensors
- Support for additional disaster types (landslides, forest fires)
- Mobile app with offline capabilities
- Integration with government alerting systems

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Infosys Global Hackathon 2025
- OpenWeatherMap for weather data
- Twilio for Mail capabilities 