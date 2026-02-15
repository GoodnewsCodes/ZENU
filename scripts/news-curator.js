document.addEventListener("DOMContentLoaded", () => {
  const fetchBtn = document.getElementById("fetchBtn");
  const articleUrlInput = document.getElementById("articleUrl");
  const fetchStatus = document.getElementById("fetchStatus");
  const articlesList = document.getElementById("articlesList");

  // Load articles on start
  loadArticles();

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
                <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">${article.title}</h3>
                
                ${
                  article.summary
                    ? `
                    <div class="summary-box" style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.9rem; border-left: 3px solid var(--accent-color);">
                        <strong>Summary:</strong>
                        <div style="margin-top: 0.5rem; color: var(--medium-gray); line-height: 1.4;">${article.summary.replace(/\n/g, "<br>")}</div>
                    </div>
                `
                    : ``
                }

                <div class="article-actions" style="display: flex; gap: 0.5rem; margin-top: auto;">
                    ${
                      !article.summary
                        ? `
                        <button class="btn btn-secondary summarize-btn" style="flex: 1; font-size: 0.8rem; padding: 0.5rem;" onclick="summarizeArticle('${article.id}')">Summarize</button>
                    `
                        : `
                        <button class="btn btn-primary draft-script-btn" style="flex: 1; font-size: 0.8rem; padding: 0.5rem;" onclick="draftScript('${article.id}')">Draft Script</button>
                    `
                    }
                    <a href="${article.url}" target="_blank" class="btn btn-outline" style="font-size: 0.8rem; padding: 0.5rem; text-decoration: none; text-align: center;">Source</a>
                </div>
            </div>
        `,
      )
      .join("");
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

  window.draftScript = async (id) => {
    const btn = document.querySelector(
      `.article-card[data-id="${id}"] .draft-script-btn`,
    );
    try {
      if (btn) btn.textContent = "Generating...";
      const script = await window.ZenuAPI.generateScript(id);
      // Redirect to script editor with the new script ID (or show a modal)
      alert("Script generated! You can find it in the Script Editor.");
      window.location.href = "script-editor.html";
    } catch (error) {
      alert("Script generation failed: " + error.message);
    } finally {
      if (btn) btn.textContent = "Draft Script";
    }
  };
});
