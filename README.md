# ZENU - AI Agent Radio Producer

![ZENU Logo](https://img.shields.io/badge/ZENU-AI%20Radio%20Producer-E30B5C?style=for-the-badge)

## 🎙️ Overview

ZENU is a personal digital producer for radio presenters and OAPs (On-Air Personalities). It leverages AI to help create professional scripts, curate news from multiple sources, and streamline the entire broadcasting workflow.

### ✨ Key Features

- **AI Script Generation** - Generate professional, personalized scripts in your unique voice
- **Smart News Curation** - Fetch and curate news from Vanguard, Punch, Arise News, and custom RSS feeds
- **Professional Teleprompter** - Full-screen teleprompter with adjustable speed and pacing
- **Voice Personalization** - Upload voice samples for AI to match your presenting style
- **Template Library** - Pre-built templates for various show formats
- **Multi-Platform Export** - Export to email, Slack, WhatsApp, or PDF

## 📁 Project Structure

```
ZENU/
├── index.html                 # Landing page
├── onboarding.html           # User onboarding wizard
├── dashboard.html            # Main dashboard
├── script-editor.html        # Script editing interface
├── teleprompter.html         # Teleprompter display
├── news-curator.html         # News curation interface
├── profile.html              # User profile management
├── 404.html                  # Error page
│
├── styles/
│   ├── global.css           # Global styles & design system
│   ├── navbar.css           # Navigation bar styles
│   ├── footer.css           # Footer styles
│   ├── index.css            # Landing page styles
│   ├── onboarding.css       # Onboarding wizard styles
│   ├── dashboard.css        # Dashboard styles
│   ├── script-editor.css    # Script editor styles
│   ├── teleprompter.css     # Teleprompter styles
│   ├── news-curator.css     # News curator styles
│   ├── profile.css          # Profile page styles
│   └── 404.css              # Error page styles
│
└── scripts/
    ├── navigation.js         # Navigation & menu interactions
    ├── auth.js              # Authentication & session management
    ├── api-client.js        # API communication utility
    ├── index.js             # Landing page interactions
    ├── onboarding.js        # Onboarding wizard logic
    ├── dashboard.js         # Dashboard functionality
    ├── script-editor.js     # Script editor logic
    ├── teleprompter.js      # Teleprompter controls
    ├── news-curator.js      # News curation logic
    └── profile.js           # Profile management
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

### Spacing

- Uses a consistent spacing scale: xs (0.25rem) to 3xl (4rem)
- Mobile-first responsive design
- Breakpoints: 768px (mobile), 1024px (tablet)

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No build tools required - pure HTML, CSS, and JavaScript

### Installation

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No server required for basic functionality

### For Development

If you want to run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (with http-server)
npx http-server -p 8000
```

Then navigate to `http://localhost:8000`

## 📖 User Guide

### 1. Onboarding

1. Visit the landing page and click "Get Started"
2. Complete the 5-step onboarding process:
   - **Step 1**: Enter your profile information
   - **Step 2**: Define your voice style and tone
   - **Step 3**: Set language and show preferences
   - **Step 4**: Upload a voice sample (optional)
   - **Step 5**: Complete setup and go to dashboard

### 2. Dashboard

- View recent scripts
- Quick access to all features
- See statistics and overview
- Access templates

### 3. News Curator

- Select news sources (Vanguard, Punch, Arise, RSS)
- Filter by keywords and topics
- Preview and select news items
- Generate AI summaries

### 4. Script Editor

- Choose a template
- Add news items
- Generate AI script
- Edit and refine
- Save and export

### 5. Teleprompter

- Load your script
- Adjust scroll speed
- Control font size
- Use pacing indicators
- Full-screen mode

### 6. Profile

- Update personal information
- Manage voice preferences
- Configure integrations
- View account settings

## 🔧 Technical Details

### Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - No frameworks required
- **LocalStorage** - Client-side data persistence

### Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance

- Lightweight - No heavy frameworks
- Fast load times
- Optimized animations
- Responsive images

## 🎯 Features in Detail

### AI Script Generation

The script generation feature uses AI to create personalized content based on:

- Your voice style preferences
- Selected news items
- Show template structure
- Language preferences

### News Curation

Fetch news from multiple sources:

- **Vanguard** - Nigerian news
- **Punch** - Nigerian news
- **Arise News** - International news
- **Custom RSS** - Add your own sources

### Voice Personalization

Upload voice samples to help ZENU:

- Match your tone and style
- Use your common phrases
- Adapt to your presenting personality

### Export Options

Export scripts to:

- **PDF** - For printing or archiving
- **Email** - Send to yourself or team
- **Slack** - Share with production team
- **WhatsApp** - Quick mobile access

## 🔐 Data & Privacy

- All data stored locally in browser (LocalStorage)
- No server-side storage in demo version
- Voice samples processed securely
- User controls all personal data

## 🛠️ Customization

### Changing Theme Color

Edit `styles/global.css`:

```css
:root {
  --primary-color: #e30b5c; /* Change this */
}
```

### Adding New Templates

Edit `scripts/api-client.js` and add to `mockTemplates`:

```javascript
{
  id: 4,
  name: 'Your Template',
  description: 'Template description',
  structure: ['Section 1', 'Section 2', ...]
}
```

## 📱 Mobile Responsiveness

- Fully responsive design
- Mobile-first approach
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚧 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time news fetching
- [ ] Advanced AI voice cloning
- [ ] Collaborative editing
- [ ] Analytics dashboard
- [ ] Mobile app (iOS/Android)
- [ ] Voice recording within app
- [ ] Multi-language support expansion

## 📄 License

Copyright © 2026 ZENU. All rights reserved.

## 👥 Support

For support, feature requests, or bug reports:

- Email: support@zenu.app
- Documentation: [docs.zenu.app](https://docs.zenu.app)

## 🙏 Acknowledgments

- Designed for radio presenters and OAPs
- Built with modern web standards
- Inspired by professional broadcasting workflows

---

## Contributors

- [Goodnews Anwana](https://github.com/GoodnewsCodes)
- [Emmanuel Raymond](https://github.com/rashfordpee)

**Made with ❤️ for Radio Presenters**

_Transform your broadcasting with ZENU - Your Personal Digital Producer_
