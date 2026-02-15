# ZENU - Project Navigation & Page Structure

This document outlines the purpose of each page and the primary user flows within the application.

## 📄 Page Catalog

| Page              | Filename             | Purpose                       | Key Features                                               |
| :---------------- | :------------------- | :---------------------------- | :--------------------------------------------------------- |
| **Landing**       | `index.html`         | Entry point for new users     | Hero section, features overview, "Get Started" CTA.        |
| **Onboarding**    | `onboarding.html`    | First-time setup (simplified) | Show name, personality style, and news source selection.   |
| **Dashboard**     | `dashboard.html`     | Central control hub           | Quick actions, recent scripts, news highlights, and stats. |
| **News Curator**  | `news-curator.html`  | Content gathering             | Fetching the latest news from selected local sources.      |
| **Script Editor** | `script-editor.html` | Production workspace          | AI script generation based on curated news and show tone.  |
| **Teleprompter**  | `teleprompter.html`  | Broadcast interface           | High-contrast, scrolling text view for live presentations. |
| **Profile**       | `profile.html`       | Settings management           | Update show details, tone preferences, and AI API keys.    |
| **Error Page**    | `404.html`           | Fallback for missing routes   | Friendly message and link back to Home/Dashboard.          |

---

## 🗺️ User Navigation Flow

### 1. The Welcome Flow (First Run)

`index.html` ➔ `onboarding.html` ➔ `dashboard.html`

- **Goal**: Get the user set up and straight to their dashboard as quickly as possible.

### 2. The Production Loop (Daily Workflow)

`dashboard.html` ➔ `news-curator.html` ➔ `script-editor.html` ➔ `teleprompter.html`

- **Step 1**: Find interesting news stories from the curator.
- **Step 2**: Generate a radio-ready script in the editor.
- **Step 3**: Use the teleprompter for the live broadcast.

### 3. Settings & Maintenance

`dashboard.html` ➔ `profile.html`

- **Goal**: Adjust show settings or update AI configuration without resetting progress.

---

## 🛠️ Technical Details (Local Hosting)

- **State Management**: Authentication and initial profile data are managed via `localStorage`.
- **Backend Connectivity**: All production data (scripts, curated news) will be stored in a local **SQLite** database managed by a **Fastify** server.
- **AI Integration**: Scripts are generated via **Groq** (LLM) and **Jina Reader** (Extractors) using user-provided API keys.
