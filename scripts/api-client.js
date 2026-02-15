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

    const headers = { ...options.headers };
    if (options.body) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      ...options,
      headers,
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

  async autoFetchArticles(limit = 10) {
    return this.request("/articles/auto-fetch", {
      method: "POST",
      body: JSON.stringify({ limit }),
    });
  }

  async fetchFullContent(articleId) {
    return this.request(`/articles/${articleId}/fetch-full`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  // Scripts
  async getScripts() {
    return this.request("/scripts");
  }

  async getScript(id) {
    return this.request(`/scripts/${id}`);
  }

  async createScript(data) {
    return this.request("/scripts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateScript(id, data) {
    return this.request(`/scripts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteScript(id) {
    return this.request(`/scripts/${id}`, {
      method: "DELETE",
    });
  }

  async generateScript(articleId, prompt, options = {}) {
    return this.request("/scripts/generate", {
      method: "POST",
      body: JSON.stringify({
        articleId,
        prompt,
        hostName: options.hostName,
        startCatchphrase: options.startCatchphrase,
        endCatchphrase: options.endCatchphrase,
        catchphrasePosition: options.catchphrasePosition,
      }),
    });
  }
}

const api = new ZenuAPI();
window.ZenuAPI = api;
