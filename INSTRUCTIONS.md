# ZENU - Setup Instructions

Follow these steps to set up the ZENU backend and the News Curator functionality.

## 1. Backend Setup

The backend is located in the `/server` directory and uses **Fastify**, **Prisma (SQLite)**, and **Groq**.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) installed (`npm install -g pnpm`)

### Installation & Initialization

Open your terminal in the `server` directory and run:

```bash
# 1. Install dependencies
pnpm install

# 2. Set up the database schema
npx prisma migrate dev --name init

# 3. Generate Prisma client
pnpm prisma:generate
```

## 2. Environment Variables

Create or update the `.env` file in the `server` directory with your API keys:

```env
DATABASE_URL="file:./dev.db"

# API Keys
GROQ_API_KEY="your_groq_api_key_here"       # Get from groq.com
ELEVEN_LABS_API_KEY="your_eleven_labs_api_key_here" # Optional for now
JINA_API_KEY="your_jina_api_key_here"       # Get from r.jina.ai (optional, helps with high traffic)

# Port
PORT=3000
```

## 3. Running the Application

### Start the Backend

In the `server` directory:

```bash
pnpm dev
```

The server will start at `http://localhost:3000`.

### Start the Frontend

Since the frontend is vanilla HTML/JS, you can use any static file server or simply open `index.html` with **Live Server** (VS Code extension).

## 4. Testing the News Curator

1.  Open the **News Curator** page from the navigation.
2.  Paste a URL from a news site (e.g., a Vanguard or Punch Nigeria article).
3.  Click **Fetch News**. The article should appear in the grid.
4.  Click **Summarize** to let AI (Groq) create bullet points.
5.  Click **Draft Script** to convert the news into a radio script.

## 5. Troubleshooting

- **CORS Errors**: Ensure the backend is running on port 3000.
- **API Errors**: Double-check your `GROQ_API_KEY` in the `.env` file.
- **Database Errors**: If you change the schema, run `npx prisma migrate dev` again.
