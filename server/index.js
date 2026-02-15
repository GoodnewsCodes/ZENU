require("dotenv").config();
const fastify = require("fastify")({ logger: true });
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const prisma = new PrismaClient();

// --- CORS Setup ---
fastify.register(require("@fastify/cors"), {
  origin: true, // Reflect the request origin, most compatible for local dev
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Register Static Files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "../"),
  prefix: "/",
});

// Middleware to log requests (helps debugging)
fastify.addHook("onRequest", async (request, reply) => {
  console.log(
    `[${new Date().toLocaleTimeString()}] ${request.method} ${request.url}`,
  );
});

// --- API Routes ---

// 1. Articles - List all
fastify.get("/api/articles", async (request, reply) => {
  try {
    const articles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
    });
    return articles;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to fetch articles" });
  }
});

// 2. Articles - Fetch from URL (Jina Reader)
fastify.post("/api/articles/fetch", async (request, reply) => {
  const { url } = request.body;
  if (!url) return reply.status(400).send({ error: "URL is required" });

  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const response = await axios.get(jinaUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      },
    });

    const data = response.data;
    const content = data.data.content || data.data.text;
    const title = data.data.title || "Untitled Article";

    const article = await prisma.article.upsert({
      where: { url },
      update: { content, title },
      create: { url, content, title, source: new URL(url).hostname },
    });

    return article;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to fetch news from URL" });
  }
});

// 3. Articles - Summarize (Groq)
fastify.post("/api/articles/:id/summarize", async (request, reply) => {
  const { id } = request.params;
  console.log(`Summarizing article: ${id}`);

  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      console.log(`Article not found: ${id}`);
      return reply.status(404).send({ error: "Article not found" });
    }

    if (!article.content) {
      console.log(`Article content is empty: ${id}`);
      return reply.status(400).send({ error: "Article content is empty" });
    }

    console.log(`Sending content to Groq (length: ${article.content.length})`);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional news editor. Summarize the following news article into 3-4 concise bullet points for a radio broadcaster. Maintain a neutral but engaging tone.",
          },
          { role: "user", content: article.content },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const summary = response.data.choices[0].message.content;

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { summary, status: "curated" },
    });

    console.log(`Article summarized successfully: ${id}`);
    return updatedArticle;
  } catch (error) {
    console.error(
      "Summarization error details:",
      error.response?.data || error.message,
    );
    reply.status(500).send({
      error: "Failed to summarize article",
      details: error.response?.data?.error?.message || error.message,
    });
  }
});

// 4. Scripts - Generate Radio Script (Groq)
fastify.post("/api/scripts/generate", async (request, reply) => {
  const { articleId, prompt } = request.body;

  try {
    let context = "";
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });
      context = article ? `Based on this news: ${article.content}` : "";
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are an expert radio scriptwriter. Create a ready-to-read script for a news segment. Use a conversational, authoritative, and flowing style. Include [Intro Music], [Pause], [Host Name] cues if relevant.",
          },
          {
            role: "user",
            content: `${context}\n\nUser request: ${prompt || "Generate a standard news script for this article."}`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    const content = response.data.choices[0].message.content;

    const script = await prisma.script.create({
      data: {
        title: `Script: ${new Date().toLocaleDateString()}`,
        content,
        articleId,
      },
    });

    return script;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to generate script" });
  }
});

// Start Server
const start = async () => {
  try {
    const port = process.env.PORT || 3001;
    const host = "127.0.0.1";
    await fastify.listen({ port, host });
    console.log(`Server running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
