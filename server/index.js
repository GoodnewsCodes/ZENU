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

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  if (error.statusCode === 400) {
    console.error(
      `[400 Error] ${request.method} ${request.url}:`,
      error.message,
    );
    reply.status(400).send({
      error: "Bad Request",
      details: error.message,
    });
    return;
  }
  console.error(`[Global Error] ${request.method} ${request.url}:`, error);
  reply.status(error.statusCode || 500).send({
    error: error.name || "Internal Server Error",
    message: error.message,
  });
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

    const textToSummarize = article.content || article.snippet;
    if (!textToSummarize) {
      console.log(`Article content and snippet are empty: ${id}`);
      return reply.status(400).send({
        error:
          "No content or snippet available to summarize. Try fetching full content first.",
      });
    }

    console.log(`Sending text to Groq (length: ${textToSummarize.length})`);

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You are a professional news editor. Summarize the following news article into 3-4 concise bullet points for a radio broadcaster. Maintain a neutral but engaging tone. Output ONLY the bullet points without any preamble or introduction.",
          },
          { role: "user", content: textToSummarize },
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
  const {
    articleId,
    prompt,
    startCatchphrase,
    endCatchphrase,
    catchphrasePosition,
    hostName,
  } = request.body;

  try {
    let context = "";
    if (articleId) {
      const article = await prisma.article.findUnique({
        where: { id: articleId },
      });
      if (article) {
        context = `Article Title: ${article.title}\n`;
        if (article.summary) context += `Summary Points: ${article.summary}\n`;
        if (article.content) {
          context += `Full Content: ${article.content}\n`;
        } else if (article.snippet) {
          context += `News Snippet: ${article.snippet}\n`;
        }
        context = `The following news information is available:\n\n${context}`;
      }
    }

    let catchphraseInstruction = "";
    if (catchphrasePosition === "start" || catchphrasePosition === "both") {
      if (startCatchphrase)
        catchphraseInstruction += `Include the host's start catchphrase "${startCatchphrase}" at the very beginning of the script. `;
    }
    if (catchphrasePosition === "end" || catchphrasePosition === "both") {
      if (endCatchphrase)
        catchphraseInstruction += `Include the host's end catchphrase "${endCatchphrase}" at the very end of the script. `;
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert radio scriptwriter. Create a ready-to-read script for a news segment. Use a conversational, authoritative, and flowing style. Include [Intro Music], [Pause], or sound effect cues if relevant, but DO NOT add prefixes like "HOST:", "PRESENTER:", or the host's name at the start of paragraphs. The script should be ready to read directly. ${hostName ? `The host's name is ${hostName}.` : ""} ${catchphraseInstruction}`,
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

// 5. Scripts - List all
fastify.get("/api/scripts", async (request, reply) => {
  try {
    const scripts = await prisma.script.findMany({
      orderBy: { createdAt: "desc" },
    });
    return scripts;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to fetch scripts" });
  }
});

// 6. Scripts - Get single
fastify.get("/api/scripts/:id", async (request, reply) => {
  const { id } = request.params;
  try {
    const script = await prisma.script.findUnique({
      where: { id },
    });
    if (!script) return reply.status(404).send({ error: "Script not found" });
    return script;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to fetch script" });
  }
});

// 7. Scripts - Create manual
fastify.post("/api/scripts", async (request, reply) => {
  const { title, content, voiceId, articleId } = request.body;
  try {
    const script = await prisma.script.create({
      data: {
        title: title || `Script: ${new Date().toLocaleDateString()}`,
        content: content || "",
        voiceId,
        articleId,
      },
    });
    return script;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to create script" });
  }
});

// 8. Scripts - Update
fastify.put("/api/scripts/:id", async (request, reply) => {
  const { id } = request.params;
  const { title, content, voiceId, articleId } = request.body;
  try {
    const script = await prisma.script.update({
      where: { id },
      data: {
        title,
        content,
        voiceId,
        articleId,
      },
    });
    return script;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to update script" });
  }
});

// 9. Scripts - Delete
fastify.delete("/api/scripts/:id", async (request, reply) => {
  const { id } = request.params;
  console.log(`Attempting to delete script with ID: ${id}`);
  try {
    const script = await prisma.script.findUnique({ where: { id } });
    if (!script) {
      console.log(`Script not found for deletion: ${id}`);
      return reply.status(404).send({ error: "Script not found" });
    }
    await prisma.script.delete({ where: { id } });
    console.log(`Script deleted successfully: ${id}`);
    return { success: true };
  } catch (error) {
    console.error("Delete script error:", error);
    reply.status(500).send({
      error: "Failed to delete script",
      details: error.message,
    });
  }
});

// 8. Auto-fetch from NewsAPI and RSS Feeds (Legally Compliant Approach)
fastify.post("/api/articles/auto-fetch", async (request, reply) => {
  const { limit = 10 } = request.body;
  const fetchedArticles = [];

  // A. Use NewsAPI if key is available (Most stable and legally sound)
  if (process.env.NEWS_API_KEY) {
    try {
      console.log("Fetching from NewsAPI...");
      const newsResponse = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=ng&pageSize=${limit}`,
        {
          headers: { "X-Api-Key": process.env.NEWS_API_KEY },
        },
      );

      for (const item of newsResponse.data.articles) {
        if (!item.url || !item.title) continue;

        const existing = await prisma.article.findUnique({
          where: { url: item.url },
        });

        if (!existing) {
          const article = await prisma.article.create({
            data: {
              url: item.url,
              title: item.title,
              snippet: item.description || item.content || "",
              source: item.source?.name || new URL(item.url).hostname,
              publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
              status: "pending",
            },
          });
          fetchedArticles.push(article);
        }
      }
    } catch (apiError) {
      fastify.log.warn(`NewsAPI failed: ${apiError.message}`);
    }
  }

  // B. Fallback/Supplement with RSS Feeds
  const rssFeeds = [
    "https://punchng.com/feed/",
    "https://www.vanguardngr.com/feed/",
    "https://www.premiumtimesng.com/feed",
    "https://dailytrust.com/feed",
    "https://thenationonlineng.net/feed/",
  ];

  try {
    const Parser = require("rss-parser");
    const parser = new Parser();

    for (const feedUrl of rssFeeds) {
      if (fetchedArticles.length >= limit) break;

      try {
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items.slice(0, 3); // Take few from each

        for (const item of items) {
          try {
            const existing = await prisma.article.findUnique({
              where: { url: item.link },
            });

            if (!existing) {
              const article = await prisma.article.create({
                data: {
                  url: item.link,
                  title: item.title,
                  snippet: item.contentSnippet || item.description || "",
                  source: new URL(item.link).hostname,
                  publishedAt: item.pubDate ? new Date(item.pubDate) : null,
                  status: "pending",
                },
              });
              fetchedArticles.push(article);
              if (fetchedArticles.length >= limit) break;
            }
          } catch (itemError) {
            fastify.log.warn(`RSS item skip: ${itemError.message}`);
          }
        }
      } catch (feedError) {
        fastify.log.warn(`RSS feed skip ${feedUrl}: ${feedError.message}`);
      }
    }

    return {
      success: true,
      fetched: fetchedArticles.length,
      articles: fetchedArticles,
    };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "Failed to auto-fetch articles" });
  }
});

// 6. Articles - Manual Full Content Fetch (Explicit Action)
fastify.post("/api/articles/:id/fetch-full", async (request, reply) => {
  const { id } = request.params;

  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return reply.status(404).send({ error: "Article not found" });

    console.log(`Manually fetching full content for: ${article.url}`);

    const jinaUrl = `https://r.jina.ai/${article.url}`;
    const response = await axios.get(jinaUrl, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      },
      timeout: 15000,
    });

    const data = response.data;
    const content = data.data.content || data.data.text;
    const title = data.data.title || article.title;

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { content, title },
    });

    return updatedArticle;
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({
      error: "Failed to fetch full article content",
      details:
        "This might be due to website protections or Jina Reader limitations.",
    });
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
