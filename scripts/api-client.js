// ========================================
// ZENU - API Client
// ========================================

const API_BASE_URL = 'https://api.zenu.app'; // Replace with actual API URL

class ZenuAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
    }
    
    // Helper method for making requests
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...this.getAuthHeaders()
            }
        };
        
        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
    
    // Get authentication headers
    getAuthHeaders() {
        const token = localStorage.getItem('zenuAuthToken');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
    
    // ========================================
    // News API Methods
    // ========================================
    
    async fetchNews(sources = [], keywords = []) {
        return this.request('/news/fetch', {
            method: 'POST',
            body: JSON.stringify({ sources, keywords })
        });
    }
    
    async getNewsArticle(articleId) {
        return this.request(`/news/${articleId}`);
    }
    
    async summarizeNews(articleId) {
        return this.request(`/news/${articleId}/summarize`, {
            method: 'POST'
        });
    }
    
    // ========================================
    // Script API Methods
    // ========================================
    
    async generateScript(data) {
        return this.request('/scripts/generate', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    async getScripts(limit = 10) {
        return this.request(`/scripts?limit=${limit}`);
    }
    
    async getScript(scriptId) {
        return this.request(`/scripts/${scriptId}`);
    }
    
    async saveScript(scriptData) {
        return this.request('/scripts', {
            method: 'POST',
            body: JSON.stringify(scriptData)
        });
    }
    
    async updateScript(scriptId, scriptData) {
        return this.request(`/scripts/${scriptId}`, {
            method: 'PUT',
            body: JSON.stringify(scriptData)
        });
    }
    
    async deleteScript(scriptId) {
        return this.request(`/scripts/${scriptId}`, {
            method: 'DELETE'
        });
    }
    
    // ========================================
    // User Profile API Methods
    // ========================================
    
    async getUserProfile() {
        return this.request('/user/profile');
    }
    
    async updateUserProfile(profileData) {
        return this.request('/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }
    
    async uploadVoiceSample(file) {
        const formData = new FormData();
        formData.append('voice', file);
        
        return this.request('/user/voice-sample', {
            method: 'POST',
            headers: {
                ...this.getAuthHeaders()
            },
            body: formData
        });
    }
    
    // ========================================
    // Template API Methods
    // ========================================
    
    async getTemplates() {
        return this.request('/templates');
    }
    
    async getTemplate(templateId) {
        return this.request(`/templates/${templateId}`);
    }
    
    // ========================================
    // Export API Methods
    // ========================================
    
    async exportScript(scriptId, format = 'pdf') {
        return this.request(`/scripts/${scriptId}/export?format=${format}`);
    }
    
    async shareScript(scriptId, method, destination) {
        return this.request(`/scripts/${scriptId}/share`, {
            method: 'POST',
            body: JSON.stringify({ method, destination })
        });
    }
}

// Create singleton instance
const api = new ZenuAPI();

// Export for use in other scripts
window.ZenuAPI = api;

// ========================================
// Mock Data for Development
// ========================================

// Mock news data
const mockNews = [
    {
        id: 1,
        title: 'Breaking: Economic Growth Reaches New Heights',
        source: 'Vanguard',
        category: 'Business',
        summary: 'Nigeria\'s economy shows strong growth in Q4 2024...',
        publishedAt: new Date().toISOString(),
        url: '#'
    },
    {
        id: 2,
        title: 'Sports: Super Eagles Qualify for AFCON',
        source: 'Punch',
        category: 'Sports',
        summary: 'Nigeria\'s national team secures qualification...',
        publishedAt: new Date().toISOString(),
        url: '#'
    },
    {
        id: 3,
        title: 'Technology: New AI Innovations Transform Industries',
        source: 'Arise News',
        category: 'Technology',
        summary: 'Latest AI developments are reshaping how we work...',
        publishedAt: new Date().toISOString(),
        url: '#'
    }
];

// Mock scripts data
const mockScripts = [
    {
        id: 1,
        title: 'Morning Show - January 15, 2025',
        template: 'Morning Show',
        createdAt: new Date().toISOString(),
        content: 'Good morning listeners! Welcome to another beautiful day...',
        wordCount: 450
    },
    {
        id: 2,
        title: 'News Bulletin - Breaking Stories',
        template: 'News Bulletin',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        content: 'Here are today\'s top stories...',
        wordCount: 320
    }
];

// Mock templates data
const mockTemplates = [
    {
        id: 1,
        name: 'Morning Show',
        description: 'Perfect for morning drive shows',
        structure: ['Greeting', 'News', 'Weather', 'Traffic', 'Music']
    },
    {
        id: 2,
        name: 'News Bulletin',
        description: 'Quick news updates',
        structure: ['Headlines', 'Top Stories', 'Sports', 'Weather']
    },
    {
        id: 3,
        name: 'Talk Show',
        description: 'Interview and discussion format',
        structure: ['Introduction', 'Guest Intro', 'Discussion', 'Closing']
    }
];

// Helper function to get mock data (for development)
window.getMockData = function(type) {
    switch(type) {
        case 'news':
            return Promise.resolve(mockNews);
        case 'scripts':
            return Promise.resolve(mockScripts);
        case 'templates':
            return Promise.resolve(mockTemplates);
        default:
            return Promise.resolve([]);
    }
};
