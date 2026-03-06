# ZENU - AI Agent Radio Producer

![ZENU Logo](https://img.shields.io/badge/ZENU-AI%20Radio%20Producer-E30B5C?style=for-the-badge)

## 🎙️ Overview

ZENU is a personal digital producer for radio presenters and OAPs (On-Air Personalities). It leverages AI to help create professional scripts, curate news from multiple sources, and streamline the entire broadcasting workflow.

### ✨ Key Features

- **AI Script Generation** - Generate professional, personalized scripts in your unique voice using Llama 3 via Groq.
- **Smart News Curation** - Auto-fetch and summarize news from Vanguard, Punch, Arise News, and custom RSS feeds.
- **Professional Teleprompter** - Full-screen teleprompter with adjustable speed and pacing.
- **Voice Personalization** - Upload voice samples for AI to match your presenting style.
- **Template Library** - Pre-built templates for various show formats.
- **Multi-Platform Export** - Export to email, Slack, WhatsApp, or PDF.

## 📁 Project Structure

```text
ZENU/
├── index.html                 # Landing page
├── onboarding.html            # User onboarding wizard
├── dashboard.html             # Main dashboard
├── script-editor.html         # Script editing interface
├── teleprompter.html          # Teleprompter display
├── news-curator.html          # News curation interface
├── profile.html               # User profile management
├── 404.html                   # Error page
│
├── server/                    # Fastify Backend & API
│   ├── index.js               # Main server logic, API endpoints
│   ├── prisma/                # Prisma schema for SQLite database
│   ├── dev.db                 # SQLite database storage
│   └── package.json           # Backend dependencies and scripts
│
├── styles/                    # Global & component CSS styles
└── scripts/                   # Frontend JavaScript files
```

## 🎨 Design System

### Color Palette

- **Primary Color**: `#E30B5C` - Vibrant pink/magenta
- **Primary Dark**: `#B00947` - Darker shade for hover states
- **Primary Light**: `#FF1493` - Lighter accent color
- **Dark Navy**: `#001a33` - Dark backgrounds
- **Off White**: `#f5f5f5` - Light backgrounds

### Typography

- **Font Family**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto')
- **Display Font**: Inter (for headings)
- **Font Sizes**: Responsive scale from 0.75rem to 3.75rem

## 🚀 How it Works

ZENU uses a lightweight Vanilla JS frontend served by a Fastify Node.js backend. The backend manages a SQLite database using Prisma, which stores your curated news articles and generated scripts. 

When you fetch news or generate scripts, the server communicates with:
1. **Jina Reader API**: To extract readable text from web articles.
2. **Groq API**: To quickly summarize articles and generate complete radio scripts using the `llama-3.3-70b-versatile` model.
3. **NewsAPI & RSS**: To automatically crawl top headlines and feeds.

## 💻 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/GoodnewsCodes/ZENU.git
   cd ZENU
   ```

2. **Navigate to the server directory and install dependencies:**
   ```bash
   cd server
   pnpm install
   ```

3. **Environment Configuration:**
   Copy the environment template:
   ```bash
   cp .env.template .env
   ```
   Edit the `.env` file to add your API keys:
   - `GROQ_API_KEY`: Required for AI script generation and article summarization.
   - `JINA_API_KEY`: Required for content extraction.
   - `NEWS_API_KEY`: (Optional) For fetching Nigerian headlines from NewsAPI.

4. **Database Setup:**
   Initialize your SQLite database using Prisma:
   ```bash
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Start the Development Server:**
   ```bash
   pnpm run dev
   ```
   The backend will start and serve the frontend statically. Navigate to:
   **[http://localhost:3001](http://localhost:3001)**

## 📖 User Guide

### 1. Onboarding
- Visit the landing page and click "Get Started"
- Enter your profile info, preferred voice tone, and show preferences.

### 2. Dashboard
- View recent scripts, statistics, and quickly access all ZENU tools.

### 3. News Curator
- Fetch the latest news from Vanguard, Punch, etc., or input a specific URL.
- AI will extract and summarize the article into quick bullet points.

### 4. Script Editor
- Build a full broadcast script around curated news.
- ZENU uses AI (via Groq) to weave the news summaries into a natural, spoken-word script matched to your persona.

### 5. Teleprompter
- Read your generated script with an adjustable scrolling screen and pacing indicators.

### 6. Profile
- Manage your API keys, integrations, voice style, and account information.

## 🔧 Technical Details

### Frontend Core
- **HTML5/CSS3** - Semantic markup, Flexbox, CSS Grid
- **Vanilla JavaScript** - No frameworks needed for maximum performance

### Server Interface
- **Node.js & Fastify** - High-performance backend routing
- **Prisma & SQLite** - Relational data persistence
- **Axios & RSS Parser** - External API integrations

## 🔐 Data & Privacy

- All stored data (articles, generated scripts, profiles) are kept in your local SQLite database (`/server/dev.db`).
- Only required text gets sent to third-party APIs (Jina for fetching, Groq for summarization/writing).

## 🚧 Future Enhancements

- [ ] Advanced AI voice cloning and direct audio rendering
- [ ] Collaborative editing features
- [ ] Analytics dashboard
- [ ] Pre-packaged executable using Electron
- [ ] Mobile app (iOS/Android)

## 📄 License

Copyright © 2026 ZENU. All rights reserved.

## 👥 Support

For support, feature requests, or bug reports:
- Email: support@zenu.app
- Documentation: [docs.zenu.app](https://docs.zenu.app)

---

## Contributors

- [Goodnews Anwana](https://github.com/GoodnewsCodes)
- [Emmanuel Raymond](https://github.com/rashfordpee)

**Made with ❤️ for Radio Presenters**

_Transform your broadcasting with ZENU - Your Personal Digital Producer_
