document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const articleUrlInput = document.getElementById("articleUrl");
  const fetchStatus = document.getElementById("fetchStatus");
  const articlesList = document.getElementById("articlesList");
  const autoFetchBtn = document.getElementById("autoFetchBtn");
  const autoFetchToggle = document.getElementById("autoFetchToggle");
  const autoFetchStatus = document.getElementById("autoFetchStatus");

  let autoFetchInterval = null;
  const AUTO_FETCH_INTERVAL = 30 * 60 * 1000; // 30 minutes

  // Load articles on start
  loadArticles();

  // Load auto-fetch preference
  const autoFetchEnabled = localStorage.getItem("autoFetchEnabled") === "true";
  autoFetchToggle.checked = autoFetchEnabled;
  if (autoFetchEnabled) {
    startAutoFetch();
  }

  // Event Listeners
  fetchBtn.addEventListener("click", async () => {
    const url = articleUrlInput.value.trim();
    if (!url) {
      showStatus("Please enter a valid URL", "error");
      return;
    }

    try {
      fetchBtn.disabled = true;
      fetchBtn.textContent = "Fetching...";
      showStatus("Fetching article content with Jina Reader...", "info");

      await window.ZenuAPI.fetchArticleFromUrl(url);

      showStatus("Article fetched successfully!", "success");
      articleUrlInput.value = "";
      loadArticles();
    } catch (error) {
      showStatus(error.message, "error");
    } finally {
      fetchBtn.disabled = false;
      fetchBtn.textContent = "Fetch News";
    }
  });

  // Auto-fetch toggle
  autoFetchToggle.addEventListener("change", () => {
    const enabled = autoFetchToggle.checked;
    localStorage.setItem("autoFetchEnabled", enabled);

    if (enabled) {
      startAutoFetch();
      showAutoFetchStatus("Auto-fetch enabled", "success");
    } else {
      stopAutoFetch();
      showAutoFetchStatus("Auto-fetch disabled", "info");
    }
  });

  // Manual auto-fetch trigger
  autoFetchBtn.addEventListener("click", async () => {
    await performAutoFetch();
  });

  async function loadArticles() {
    try {
      const articles = await window.ZenuAPI.getArticles();
      renderArticles(articles);
    } catch (error) {
      console.error("Failed to load articles:", error);
      articlesList.innerHTML = `<div class="error-state text-center" style="grid-column: 1/-1; padding: 3rem; color: #ff4d4d;">Failed to load articles. Please check if the backend is running.</div>`;
    }
  }

  function renderArticles(articles) {
    if (!articles || articles.length === 0) {
      articlesList.innerHTML = `<div class="empty-state text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--medium-gray);">No articles found. Start by fetching news from a URL.</div>`;
      return;
    }

    articlesList.innerHTML = articles
      .map(
        (article) => `
            <div class="card article-card" data-id="${article.id}">
                <div class="article-source" style="font-size: 0.8rem; color: var(--primary-color); text-transform: uppercase; margin-bottom: 0.5rem;">${article.source}</div>
                <h3 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${article.title}</h3>
                
                ${
                  article.summary
                    ? `
                    <div class="summary-box" style="background: rgba(0, 230, 118, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; border-left: 3px solid var(--success-color, #00e676);">
                        <strong>Radio Summary:</strong>
                        <div style="margin-top: 0.5rem; color: var(--dark-navy); line-height: 1.4;">${article.summary.replace(/\n/g, "<br>")}</div>
                    </div>
                `
                    : article.snippet
                      ? `
                    <div class="snippet-box" style="margin-bottom: 1rem; font-size: 0.85rem; color: var(--medium-gray); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${article.snippet}
                    </div>
                `
                      : ``
                }

                <div class="article-actions" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: auto;">
                    ${
                      !article.summary
                        ? `
                        <button class="btn btn-primary summarize-btn" style="flex: 1; min-width: 100px; font-size: 0.8rem; padding: 0.5rem;" onclick="summarizeArticle('${article.id}')">Summarize</button>
                    `
                        : `
                        <button class="btn btn-success draft-script-btn" style="flex: 1; min-width: 100px; font-size: 0.8rem; padding: 0.5rem;" onclick="draftScript('${article.id}')">Draft Script</button>
                    `
                    }
                    
                    ${
                      !article.content
                        ? `
                        <button class="btn btn-secondary fetch-full-btn" style="flex: 1; min-width: 100px; font-size: 0.8rem; padding: 0.5rem;" onclick="fetchFullText('${article.id}')">Fetch Full</button>
                    `
                        : ``
                    }
                    
                    <a href="${article.url}" target="_blank" class="btn btn-outline" style="flex: 0.5; min-width: 60px; font-size: 0.8rem; padding: 0.5rem; text-decoration: none; text-align: center;">Source</a>
                </div>
            </div>
        `,
      )
      .join("");
  }

  async function performAutoFetch() {
    try {
      autoFetchBtn.disabled = true;
      autoFetchBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle; animation: spin 1s linear infinite;">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Fetching...
      `;
      showAutoFetchStatus("Fetching latest news from NewsAPI & RSS...", "info");

      const result = await window.ZenuAPI.autoFetchArticles(10);

      if (result.fetched > 0) {
        showAutoFetchStatus(
          `Successfully fetched ${result.fetched} new article${result.fetched > 1 ? "s" : ""}`,
          "success",
        );
        loadArticles();
      } else {
        showAutoFetchStatus("No new articles found", "info");
      }
    } catch (error) {
      showAutoFetchStatus(`Auto-fetch failed: ${error.message}`, "error");
    } finally {
      autoFetchBtn.disabled = false;
      autoFetchBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        Fetch Latest News Now
      `;
    }
  }

  function startAutoFetch() {
    if (autoFetchInterval) return;

    // Fetch immediately
    performAutoFetch();

    // Then set up interval
    autoFetchInterval = setInterval(() => {
      performAutoFetch();
    }, AUTO_FETCH_INTERVAL);

    const nextFetch = new Date(Date.now() + AUTO_FETCH_INTERVAL);
    showAutoFetchStatus(
      `Next auto-fetch at ${nextFetch.toLocaleTimeString()}`,
      "info",
    );
  }

  function stopAutoFetch() {
    if (autoFetchInterval) {
      clearInterval(autoFetchInterval);
      autoFetchInterval = null;
    }
  }

  function showAutoFetchStatus(text, type) {
    autoFetchStatus.textContent = text;
    autoFetchStatus.style.color =
      type === "error"
        ? "#ff4d4d"
        : type === "success"
          ? "#00e676"
          : "var(--medium-gray)";
  }

  function showStatus(text, type) {
    fetchStatus.textContent = text;
    fetchStatus.style.color =
      type === "error"
        ? "#ff4d4d"
        : type === "success"
          ? "#00e676"
          : "var(--medium-gray)";
  }

  // Global action handlers
  window.summarizeArticle = async (id) => {
    const btn = document.querySelector(
      `.article-card[data-id="${id}"] .summarize-btn`,
    );
    try {
      if (btn) btn.textContent = "Summarizing...";
      await window.ZenuAPI.summarizeArticle(id);
      loadArticles();
    } catch (error) {
      alert("Summarization failed: " + error.message);
    } finally {
      if (btn) btn.textContent = "Summarize";
    }
  };

  window.fetchFullText = async (id) => {
    const btn = document.querySelector(
      `.article-card[data-id="${id}"] .fetch-full-btn`,
    );
    try {
      if (btn) btn.textContent = "Fetching...";
      await window.ZenuAPI.fetchFullContent(id);
      loadArticles();
      showStatus("Full content fetched successfully!", "success");
    } catch (error) {
      alert("Failed to fetch full content: " + error.message);
    } finally {
      if (btn) btn.textContent = "Fetch Full";
    }
  };

  window.draftScript = async (id) => {
    const btn = document.querySelector(
      `.article-card[data-id="${id}"] .draft-script-btn`,
    );
    try {
      if (btn) btn.textContent = "Generating...";

      // Get user profile for catchphrase and name
      const userProfile = JSON.parse(
        localStorage.getItem("zenuUserProfile") || "{}",
      );

      const script = await window.ZenuAPI.generateScript(id, null, {
        hostName: userProfile.fullName,
        startCatchphrase: userProfile.startCatchphrase,
        endCatchphrase: userProfile.endCatchphrase,
        catchphrasePosition: userProfile.catchphrasePosition,
      });

      // Redirect to script editor with the new script ID
      window.location.href = `script-editor.html?id=${script.id}`;
    } catch (error) {
      alert("Script generation failed: " + error.message);
    } finally {
      if (btn) btn.textContent = "Draft Script";
    }
  };
});
