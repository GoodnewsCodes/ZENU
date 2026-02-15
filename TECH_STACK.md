# ZENU - Local AI Production Tech Stack

This document defines the finalized technology stack for ZENU, optimized for **local hosting**, **high speed**, and **privacy**.

## 💻 Infrastructure & Backend

| Component               | Technology  | Rationale                                                                    |
| :---------------------- | :---------- | :--------------------------------------------------------------------------- |
| **Backend Environment** | **Node.js** | Standard runtime for Fastify and Prisma.                                     |
| **API Framework**       | **Fastify** | Extremely low overhead and high performance.                                 |
| **Database**            | **SQLite**  | Local file-based database. Zero configuration and perfect for local hosting. |
| **Database ORM**        | **Prisma**  | Type-safe queries and automated schema migrations.                           |
| **Package Manager**     | **pnpm**    | Efficient disk usage and faster installs.                                    |

## 🤖 AI & Content Intelligence

| Feature               | Provider        | Model/Tool           | Why?                                                       |
| :-------------------- | :-------------- | :------------------- | :--------------------------------------------------------- |
| **Script Generation** | **Groq**        | **Llama 3 (70B/8B)** | **Speed.** Delivers radio-ready scripts in < 2 seconds.    |
| **News Extraction**   | **Jina Reader** | **Reader API**       | Converts complex news URLs into clean Markdown for the AI. |
| **Voice Synthesis**   | **ElevenLabs**  | **Multilingual v2**  | (Optional) Best-in-class natural radio voices.             |

## 🎨 Frontend & Design

| Component             | Technology           | Rationale                                                                |
| :-------------------- | :------------------- | :----------------------------------------------------------------------- |
| **Core Architecture** | **Vanilla HTML5/JS** | Lightweight, direct control, and no build-step complexity.               |
| **Styling**           | **Custom CSS3**      | High performance with Glassmorphic design and tailored animations.       |
| **Animations**        | **Canvas API**       | Particle effects and interactive UI elements.                            |
| **Client Storage**    | **LocalStorage**     | Persistent session data and profile preferences without server overhead. |

---

## 🔒 Security & Privacy (Local Context)

- **Zero Cloud Auth**: No external authentication (Clerk/Supabase) is used.
- **Local Persistence**: All scripts and personal data are stored in a local SQLite file (`dev.db`).
- **Secrets Management**: API Keys for Groq/ElevenLabs are stored in a local `.env` file and never exposed.
