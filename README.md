# 🎙️ ZENU — AI Agent for Radio Presenters & OAPs

<div align="center">

![ZENU Logo](https://img.shields.io/badge/ZENU-AI%20Producer-00ff88?style=for-the-badge&logo=radio&logoColor=white)
![IBM watsonx](https://img.shields.io/badge/IBM-watsonx%20Orchestrate-0062ff?style=for-the-badge&logo=ibm&logoColor=white)
![Status](https://img.shields.io/badge/Status-Production%20Ready-00ff88?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-00ff88?style=for-the-badge)

**Your Personal Digital Producer**

*Prepare scripts, arrange news, and match your speaking style in under 30 seconds*

[🚀 Quick Start](#-quick-start) • [📖 Documentation](#-documentation) • [🎬 Demo](#-demo) • [🏆 Features](#-features)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [IBM watsonx Integration](#-ibm-watsonx-integration)
- [User Journey](#-user-journey)
- [API Documentation](#-api-documentation)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**ZENU** is an AI-powered digital producer built specifically for radio presenters, podcasters, and On-Air Personalities (OAPs). It automates the entire script preparation workflow using IBM watsonx Orchestrate, reducing a 45-60 minute manual process to just **30 seconds**.

### What Makes ZENU Special?

- 🎯 **Personal AI Agent** - Learns your unique voice, tone, and speaking style
- 📰 **Smart News Gathering** - Fetches from Vanguard, Punch, Arise, and custom sources
- 🎨 **Tone Matching** - Rewrites content in your exact speaking style
- 📋 **Auto Script Building** - Populates your custom show template
- 🎬 **Teleprompter Ready** - Professional display with auto-scroll and controls
- 🌍 **Multilingual** - Supports English, Pidgin, Yoruba, Igbo, Hausa

---

## 😫 The Problem

Radio presenters worldwide face the same daily challenge:

- ⏰ **45-60 minutes** spent on script preparation
- 📰 Manually gathering news from multiple sources
- ✂️ Cleaning ads and irrelevant content
- ✍️ Rewriting stories in their voice
- 📝 Formatting for teleprompter display
- 🔄 Repeating this process **every single day**

**Result:** Wasted time, inconsistent quality, and presenter burnout.

---

## ✨ The Solution

ZENU automates the entire workflow using **6 orchestrated digital skills**:

```
Fetch News → Clean & Summarize → Rewrite in Tone → 
Populate Template → Generate Script → Deliver to Teleprompter
```

**Time Saved:** 45-60 minutes → **30 seconds** ⚡

**Impact:** 
- 7.5 hours saved per week per presenter
- Consistent quality across all shows
- Preserved authentic presenter voice
- Reduced preparation stress

---

## 🏆 Key Features

### 🎯 Presenter Profiling
- **Language Preferences** - English, Pidgin, Yoruba, Igbo, Hausa, Mixed
- **Speaking Characteristics** - Speed, formality, tone description
- **Signature Phrases** - Custom intro and outro
- **Topic Preferences** - Politics, sports, entertainment, business, etc.
- **Show Structure** - Fully customizable section templates

### 📰 Intelligent News Gathering
- **Multiple Sources** - Vanguard, Punch, Arise News, local reports
- **RSS Integration** - Automatic feed parsing
- **Web Scraping** - Fallback for non-RSS sources
- **Mock Data** - Demo mode without external dependencies
- **Category Filtering** - Focus on relevant topics

### 🤖 AI-Powered Processing
- **Content Cleaning** - Removes ads, noise, and irrelevant information
- **Summarization** - Broadcast-ready summaries
- **Tone Matching** - Rewrites in presenter's exact style
- **Signature Preservation** - Maintains catchphrases and personality
- **Multi-language Support** - Handles code-switching and local dialects

### 📋 Auto Script Building
Default show structure (fully customizable):
1. **Intro** - Signature opening phrase
2. **Weather** - Quick weather recap
3. **Trending News** - Top local stories
4. **Global Headlines** - International news
5. **Human Interest** - Feel-good story
6. **Traffic** - Road updates
7. **Outro** - Signature closing

### 🎬 Professional Teleprompter
- **Auto-Scroll** - Adjustable speed (10-200 px/s)
- **Font Control** - 4 size options
- **Mirror Mode** - For physical teleprompter hardware
- **Fullscreen** - Distraction-free display
- **Speaker Notes** - Hidden cues and reminders
- **Progress Bar** - Visual script progress
- **Timer** - Elapsed time display
- **13 Keyboard Shortcuts** - Complete keyboard control

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML/CSS/JS)               │
│  Landing → Onboarding → Dashboard → Editor → Teleprompter │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  EXPRESS.JS REST API                    │
│  Auth • Profile • Skills (6 Digital Skills) • Scripts  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────┬──────────────────┬──────────────────┐
│   IBM Watson     │     MongoDB      │  News Sources    │
│  watsonx.ai      │   User Profiles  │  Vanguard, Punch │
│  Orchestrate     │   Scripts        │  Arise, Local    │
└──────────────────┴──────────────────┴──────────────────┘
```

### 6 Digital Skills (IBM Orchestrate)

1. **Fetch News** - `POST /api/skills/fetch-news`
2. **Clean & Summarize** - `POST /api/skills/clean-news`
3. **Rewrite in Tone** - `POST /api/skills/rewrite-tone`
4. **Populate Template** - `POST /api/skills/populate-template`
5. **Generate Script** - `POST /api/skills/generate-script`
6. **Deliver Script** - `POST /api/skills/deliver-script`

**Complete Workflow:** `POST /api/skills/complete-workflow`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **MongoDB** ([Local](https://www.mongodb.com/try/download/community) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **IBM Cloud Account** ([Sign up](https://cloud.ibm.com/registration))

### Installation

```bash
# 1. Clone or navigate to the project
cd ZENU

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 4. Start MongoDB (if using local)
mongod

# 5. Run the application
npm start

# 6. Open in browser
http://localhost:3000
```

### Quick Start Script (Windows)

```bash
# Simply run the start script
start.bat
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/zenu
# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zenu

# IBM Watson
IBM_WATSON_API_KEY=your_api_key_here
IBM_WATSON_URL=https://us-south.ml.cloud.ibm.com
IBM_WATSON_PROJECT_ID=your_project_id_here

# IBM Orchestrate
IBM_ORCHESTRATE_API_KEY=your_orchestrate_key_here
IBM_ORCHESTRATE_URL=https://orchestrate.ibm.com/api

# Server
PORT=3000
NODE_ENV=development

# Security
JWT_SECRET=your_super_secret_jwt_key_change_this

# Optional
NEWS_API_KEY=your_news_api_key_here
```

### Getting IBM Watson Credentials

1. Go to [IBM Cloud](https://cloud.ibm.com/)
2. Create a watsonx.ai instance
3. Navigate to **Credentials**
4. Copy API Key, URL, and Project ID
5. Paste into `.env` file

---

## 🔌 IBM watsonx Integration

### Digital Skills Implementation

ZENU implements 6 digital skills that can be registered in IBM watsonx Orchestrate:

#### Skill 1: Fetch News
```javascript
POST /api/skills/fetch-news
{
  "sources": ["vanguard", "punch", "arise"],
  "categories": ["politics", "sports"],
  "limit": 10
}
```

#### Skill 2: Clean & Summarize
```javascript
POST /api/skills/clean-news
{
  "rawNews": [/* array of news items */]
}
```

#### Skill 3: Rewrite in Tone
```javascript
POST /api/skills/rewrite-tone
{
  "cleanedNews": [/* array */],
  "presenterId": "user123"
}
```

#### Skill 4: Populate Template
```javascript
POST /api/skills/populate-template
{
  "styledNews": [/* array */],
  "presenterId": "user123"
}
```

#### Skill 5: Generate Script
```javascript
POST /api/skills/generate-script
{
  "populatedScript": {/* script object */}
}
```

#### Skill 6: Deliver Script
```javascript
POST /api/skills/deliver-script
{
  "scriptId": "script123",
  "deliveryMethod": ["ui", "email"]
}
```

### OpenAPI Specification

The complete API specification is available in `openapi.yaml` and can be imported directly into IBM watsonx Orchestrate for skill registration.

---

## 👤 User Journey

### 1. Landing & Registration (`/`)
- View features and benefits
- Register new account or login
- Secure JWT authentication

### 2. Onboarding (`/onboarding`)
- **Step 1:** Select languages (English, Pidgin, Yoruba, Igbo, Hausa)
- **Step 2:** Configure speaking style (speed, formality, tone)
- **Step 3:** Add signature intro and outro phrases
- **Step 4:** Choose topic preferences
- **Step 5:** Build custom show structure

### 3. Dashboard (`/dashboard`)
- View stats (scripts generated, time saved, ready scripts)
- Select news sources (Vanguard, Punch, Arise, Local)
- Click **"Generate Script"** button
- Watch 6-step workflow progress (~30 seconds)
- View recent scripts

### 4. Script Editor (`/editor`)
- Review generated script
- Edit content section by section
- View real-time stats (words, duration, chunks)
- Save changes
- Send to teleprompter

### 5. Teleprompter (`/teleprompter`)
- Full-screen professional display
- Auto-scroll with speed control
- Keyboard shortcuts for complete control
- Speaker notes panel
- Progress bar and timer
- **Go live!** 🎙️

---

## 📚 API Documentation

### Authentication

```javascript
// Register
POST /api/auth/register
{
  "name": "DJ Goodvibes",
  "email": "dj@radio.com",
  "password": "SecurePass123!"
}

// Login
POST /api/auth/login
{
  "email": "dj@radio.com",
  "password": "SecurePass123!"
}

// Get Current User
GET /api/auth/me
Headers: { Authorization: "Bearer <token>" }
```

### Profile Management

```javascript
// Get Profile
GET /api/profile
Headers: { Authorization: "Bearer <token>" }

// Update Profile
PUT /api/profile
Headers: { Authorization: "Bearer <token>" }
Body: {
  "preferredLanguage": ["English", "Pidgin"],
  "speakingSpeed": "medium",
  "signatureIntro": "Good morning everyone!",
  "signatureOutro": "Stay blessed!",
  "topicPreferences": ["politics", "entertainment"],
  "showStructure": [/* array of sections */],
  "onboardingCompleted": true
}
```

### Scripts

```javascript
// Get All Scripts
GET /api/skills/scripts
Headers: { Authorization: "Bearer <token>" }

// Get Script by ID
GET /api/skills/script/:id
Headers: { Authorization: "Bearer <token>" }

// Complete Workflow (Main Endpoint)
POST /api/skills/complete-workflow
Headers: { Authorization: "Bearer <token>" }
Body: {
  "sources": ["vanguard", "punch", "arise"],
  "deliveryMethod": ["ui"]
}
```

For complete API documentation, see `openapi.yaml`.

---

## 💻 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** + **Mongoose** - Database
- **IBM Watson SDK** - AI integration
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **RSS Parser** - News feed parsing
- **Cheerio** - Web scraping
- **Axios** - HTTP requests

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Premium dark theme
- **Vanilla JavaScript** - No framework dependencies
- **LocalStorage** - Client-side persistence

### DevOps & Tools
- **npm** - Package management
- **nodemon** - Development auto-reload
- **dotenv** - Environment configuration
- **CORS** - Cross-origin support

---

## 📁 Project Structure

```
ZENU/
├── 📄 package.json              # Dependencies
├── 📄 README.md                 # This file
├── 📄 .env.example              # Environment template
├── 📄 openapi.yaml              # API specification
├── 📄 start.bat                 # Quick start script
│
├── 📂 server/                   # Backend
│   ├── 📄 app.js                # Main server
│   ├── 📂 routes/
│   │   ├── 📄 auth.js           # Authentication
│   │   ├── 📄 skills.js         # 6 Digital Skills
│   │   └── 📄 profile.js        # Profile management
│   └── 📂 utils/
│       ├── 📄 newsFetcher.js    # News gathering
│       └── 📄 watson.js         # Watson integration
│
└── 📂 public/                   # Frontend
    ├── 📂 css/
    │   ├── 📄 main.css          # Global styles
    │   ├── 📄 dashboard.css     # Dashboard layouts
    │   └── 📄 prompter.css      # Teleprompter styles
    ├── 📂 js/
    │   ├── 📄 auth.js           # Authentication logic
    │   ├── 📄 app.js            # Dashboard logic
    │   └── 📄 prompter.js       # Teleprompter controls
    │
    ├── 📄 index.html            # Landing page
    ├── 📄 onboarding.html       # Onboarding wizard
    ├── 📄 dashboard.html        # Main dashboard
    ├── 📄 editor.html           # Script editor
    └── 📄 teleprompter.html     # Teleprompter view
```

---

## 🎬 Demo

### For Judges (2-minute demo)

1. **Landing Page** (15s) - Show features and login
2. **Dashboard** (10s) - Select sources, click "Generate Script"
3. **Workflow** (30s) - Watch progress modal (6 steps)
4. **Editor** (20s) - Show generated script with sections
5. **Teleprompter** (30s) - Full-screen auto-scroll demo
6. **Explain** (15s) - IBM Orchestrate integration

### Demo Script

> "ZENU is an AI producer built for radio presenters, podcasters, and OAPs. Every presenter gets a personal digital agent that learns their voice, tone, and show structure. ZENU gathers the news from selected sources, cleans it, rewrites it in the presenter's exact style, arranges it into their show flow, and then delivers it inside a teleprompter-ready script. This reduces a 45–60 minute preparation workflow to under 30 seconds, and creates consistency across every radio show in the station. ZENU is built on IBM watsonx Orchestrate using six digital skills coordinating news extraction, summarization, tonality matching, script generation, and teleprompter delivery."

---

## 🎯 Impact & Metrics

### Time Savings
- **Per Script:** 45-60 minutes → 30 seconds
- **Per Week:** 7.5 hours saved (assuming 1 script/day)
- **Per Month:** 30 hours saved
- **Per Year:** 360 hours (15 days) saved

### Quality Improvements
- ✅ Consistent tone across all shows
- ✅ No missed breaking news
- ✅ Professional formatting
- ✅ Reduced presenter stress
- ✅ Authentic voice preservation

### Scalability
- **Individual:** Works for solo presenters
- **Station:** Scales to entire radio stations
- **Network:** Can serve multiple stations
- **Global:** Supports international presenters

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Make sure MongoDB is running
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### Port Already in Use
```bash
# Change port in .env
PORT=3001
```

### Watson API Not Working
The app works with mock data if Watson isn't configured.
Check console for "⚠️ Watson API not configured" message.

### Dependencies Not Installing
```bash
npm cache clean --force
rm -rf node_modules
npm install
```

---

## 📖 Documentation

- **README.md** - This file (overview and quick start)
- **PROJECT_GUIDE.md** - Detailed development guide
- **COMPLETION_SUMMARY.md** - Implementation summary
- **IMPLEMENTATION_SUMMARY.md** - Technical details
- **openapi.yaml** - Complete API specification

---

## 🤝 Contributing

This project was built for the IBM watsonx Challenge 2024. For contributions or questions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **IBM watsonx** - For the AI platform and Orchestrate
- **Nigerian Media** - Vanguard, Punch, Arise News for inspiration
- **Radio Presenters** - For the problem validation
- **Open Source Community** - For the amazing tools

---

## 📞 Contact & Support

- **Developer:** GoodnewsCodes
- **Project:** ZENU - AI Agent for Radio Presenters
- **Built For:** IBM watsonx Challenge 2024
- **Status:** Production Ready ✅

---

<div align="center">

### 🎙️ **ZENU - Because every voice deserves to be heard at its best**

![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=for-the-badge)
![IBM watsonx](https://img.shields.io/badge/Powered%20by-IBM%20watsonx-0062ff?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

**[⬆ Back to Top](#-zenu--ai-agent-for-radio-presenters--oaps)**

</div>
