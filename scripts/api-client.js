// ========================================
// ZENU - API Client
// ========================================

const API_BASE_URL = `http://${window.location.hostname}:3001/api`;

class ZenuAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || `HTTP error! status: ${response.status}`;
        throw new Error(errorMessage);
      }
      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Articles
  async getArticles() {
    return this.request("/articles");
  }

  async fetchArticleFromUrl(url) {
    return this.request("/articles/fetch", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  }

  async summarizeArticle(articleId) {
    return this.request(`/articles/${articleId}/summarize`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  // Scripts
  async generateScript(articleId, prompt) {
    return this.request("/scripts/generate", {
      method: "POST",
      body: JSON.stringify({ articleId, prompt }),
    });
  }
}

const api = new ZenuAPI();
window.ZenuAPI = api;
