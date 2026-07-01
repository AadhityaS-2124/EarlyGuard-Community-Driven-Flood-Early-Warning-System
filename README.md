<div align="center">

# 🌊 EarlyGuard

### Community-Driven Flood Early Warning System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-56%25-3178c6.svg)](#)

*Empowering communities with real-time flood intelligence through crowdsourced data and advanced analytics.*

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Installation Guide](#installation-guide)
- [Configuration](#configuration)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## 🎯 Overview

**EarlyGuard** is a revolutionary community-powered platform that bridges the critical gap between centralized weather services and ground-level realities. By leveraging crowdsourced citizen reports combined with real-time meteorological data, EarlyGuard delivers hyper-localized flood warnings that save lives and protect communities.

### Why EarlyGuard?

- **Local Intelligence**: Combine government weather data with community insights
- **Real-time Response**: Instant alerts reach citizens through multiple channels
- **Community Empowerment**: Give citizens a voice in disaster preparedness
- **Data-Driven**: Validated reports ensure accurate and reliable warnings

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🚨 **Community Reporting** | Users report rising water levels, overflowing drains, and early flooding signs through an intuitive geo-tagged interface |
| ✔️ **Data Validation** | Cross-validate reports with real-time weather data via OpenWeatherMap API |
| 📍 **Risk Visualization** | Real-time dashboard displaying risk levels and citizen reports on an interactive map |
| 🔔 **Multi-channel Alerts** | Push notifications, email, and SMS for maximum reach and accessibility |
| 📱 **Responsive Design** | Seamlessly works on desktop, tablet, and mobile devices |
| 🌐 **Real-time Synchronization** | Firebase ensures instant data updates across all users |

---

## 🛠️ Technology Stack

### Frontend Stack
```
┌─────────────────────────────────────┐
│  React.js 18+ with TypeScript (56%)  │
│  Leaflet.js - Advanced Map Layer    │
│  CSS3 - Modern Styling (17.1%)       │
│  HTML5 - Semantic Structure          │
│  JavaScript - Client Logic (24.7%)   │
└─────────────────────────────────────┘
```

**Key Libraries:**
- ⚛️ React with TypeScript for type-safe components
- 🗺️ Leaflet.js for interactive map visualization
- 📱 Responsive CSS Framework for mobile-first design

### Backend Stack
```
┌──────────────────────────────────────┐
│  Node.js + Express - REST API        │
│  Firebase Realtime Database - Data   │
│  OpenWeatherMap API - Weather Data   │
│  Twilio - Multi-channel Alerts       │
└──────────────────────────────────────┘
```

**Key Technologies:**
- 🚀 Node.js with Express for scalable APIs
- 🔥 Firebase Realtime Database for incident storage
- 🌤️ OpenWeatherMap API for meteorological validation
- 📨 Twilio for push notifications and email alerts

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** version 14.0 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js) or **yarn** ([Download](https://yarnpkg.com/))
- **Git** for version control

### Installation Guide

#### Step 1: Clone the Repository

```bash
git clone https://github.com/AadhityaS-2124/EarlyGuard-Community-Driven-Flood-Early-Warning-System.git
cd EarlyGuard-Community-Driven-Flood-Early-Warning-System
```

#### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

#### Step 3: Install Backend Dependencies

```bash
cd ../backend
npm install
# or
yarn install
```

#### Step 4: Configure Environment Variables

Create a `.env` file in the `backend` directory with the following API keys:

```env
# OpenWeatherMap
OPENWEATHER_API_KEY=your_api_key_here

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_DATABASE_URL=your_firebase_database_url
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_FROM_NUMBER=your_twilio_phone_number

# Server Configuration
PORT=5000
NODE_ENV=development
```

#### Step 5: Start the Backend Server

```bash
npm start
# Server will run on http://localhost:5000
```

#### Step 6: Start the Frontend Development Server

```bash
cd ../frontend
npm start
# Application will open at http://localhost:3000
```

---

## ⚙️ Configuration

### API Keys & Credentials

1. **OpenWeatherMap API**
   - Sign up at [openweathermap.org](https://openweathermap.org/api)
   - Get your free API key from the API keys section

2. **Firebase Setup**
   - Create a project at [firebase.google.com](https://firebase.google.com/)
   - Enable Realtime Database
   - Copy configuration from Project Settings

3. **Twilio Configuration**
   - Create account at [twilio.com](https://twilio.com/)
   - Get Account SID and Auth Token
   - Configure messaging settings

### Available Scripts

#### Frontend
```bash
npm start          # Run development server
npm run build      # Create production build
npm test           # Run test suite
npm run eject      # Eject from Create React App (irreversible)
```

#### Backend
```bash
npm start          # Start server with nodemon
npm run build      # Build TypeScript
npm test           # Run backend tests
```

---

## 📖 Usage

### For Citizens

1. **Report an Issue**
   - Open the app and navigate to the reporting section
   - Mark the flooding location on the map
   - Provide details about water levels and conditions
   - Submit with photo evidence (optional)

2. **Receive Alerts**
   - Enable push notifications in settings
   - View alerts on the dashboard
   - Check risk levels for your area

### For Administrators

1. **Monitor Reports**
   - View all community reports on the admin dashboard
   - Validate and cross-check with weather data
   - Manage alert thresholds

2. **Trigger Alerts**
   - Manually issue system-wide alerts if needed
   - Track alert delivery and engagement

---

## 🗺️ Roadmap

### Upcoming Features

- 🤖 **Machine Learning Integration** - Predictive flood modeling based on historical data patterns
- 📡 **IoT Sensor Network** - Integration with physical water level monitoring devices
- 🌋 **Disaster Expansion** - Support for landslides, forest fires, and other natural disasters
- 📲 **Native Mobile Apps** - iOS and Android apps with offline functionality
- 🏛️ **Government Integration** - Direct integration with official emergency management systems
- 🌍 **Multi-language Support** - Localization for diverse communities
- 📊 **Advanced Analytics** - Historical data analysis and trend visualization

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/EarlyGuard-Community-Driven-Flood-Early-Warning-System.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Link related issues
   - Include screenshots for UI changes

### Coding Standards

- Write clean, well-documented code
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 🙏 Acknowledgments

We extend our gratitude to:

- **Infosys Global Hackathon 2025** - For sponsoring and supporting this initiative
- **OpenWeatherMap** - For providing reliable weather data API
- **Twilio** - For enabling multi-channel communication capabilities
- **Firebase** - For scalable real-time database infrastructure
- **Our Community** - For believing in the power of collective action

---

## 📞 Support & Contact

- 📧 **Email**: [Your Email Here]
- 🐛 **Bug Reports**: [Open an Issue](https://github.com/AadhityaS-2124/EarlyGuard-Community-Driven-Flood-Early-Warning-System/issues)
- 💬 **Discussions**: [Start a Discussion](https://github.com/AadhityaS-2124/EarlyGuard-Community-Driven-Flood-Early-Warning-System/discussions)

---

<div align="center">

### ⭐ If you find this project useful, please star it!

Made with ❤️ by Aadhitya S

[⬆ Back to top](#-earlyguard)

</div>
