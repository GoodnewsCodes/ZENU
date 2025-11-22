// ========================================
// ZENU - Dashboard Script
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (typeof ZenuAuth !== 'undefined') {
        ZenuAuth.requireAuth();
    }
    
    // Initialize dashboard
    initDashboard();
    loadScripts();
    loadActivity();
    updateStats();
});

// Initialize dashboard
function initDashboard() {
    const profile = ZenuAuth?.getUserProfile();
    
    if (profile) {
        // Update welcome message
        const userName = document.querySelector('[data-user-name]');
        const showName = document.querySelector('[data-show-name]');
        
        if (userName) userName.textContent = profile.fullName || 'User';
        if (showName) showName.textContent = profile.showName || 'your show';
    }
}

// Load scripts
async function loadScripts() {
    const scriptsList = document.getElementById('scriptsList');
    if (!scriptsList) return;
    
    try {
        // Try to get scripts from API or use mock data
        let scripts = [];
        
        if (typeof getMockData === 'function') {
            scripts = await getMockData('scripts');
        }
        
        // Get scripts from localStorage
        const savedScripts = localStorage.getItem('zenuScripts');
        if (savedScripts) {
            const localScripts = JSON.parse(savedScripts);
            scripts = [...localScripts, ...scripts];
        }
        
        if (scripts.length === 0) {
            // Show empty state
            scriptsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg></div>
                    <p>No scripts yet. Create your first one!</p>
                    <a href="script-editor.html" class="btn btn-primary">Create Script</a>
                </div>
            `;
            return;
        }
        
        // Display scripts
        scriptsList.innerHTML = scripts.map(script => `
            <div class="script-item" onclick="openScript('${script.id}')">
                <div class="script-header">
                    <h3 class="script-title">${script.title}</h3>
                    <span class="script-badge">${script.template}</span>
                </div>
                <div class="script-meta">
                    <span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M8 4V8L11 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        ${formatDate(script.createdAt)}
                    </span>
                    <span>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4 6H12M4 8H12M4 10H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        ${script.wordCount} words
                    </span>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading scripts:', error);
        scriptsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <p>Error loading scripts. Please try again.</p>
            </div>
        `;
    }
}

// Load activity feed
function loadActivity() {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;
    
    const activities = [
        {
            icon: '<svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 10l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
            text: 'Profile setup completed',
            time: 'Just now'
        },
        {
            icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>',
            text: 'Welcome to ZENU!',
            time: 'Just now'
        }
    ];
    
    // Get activities from localStorage
    const savedActivities = localStorage.getItem('zenuActivities');
    if (savedActivities) {
        const localActivities = JSON.parse(savedActivities);
        activities.unshift(...localActivities);
    }
    
    activityFeed.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

// Update stats
function updateStats() {
    // Get scripts count
    const savedScripts = localStorage.getItem('zenuScripts');
    const scripts = savedScripts ? JSON.parse(savedScripts) : [];
    
    const totalScriptsEl = document.getElementById('totalScripts');
    const thisWeekEl = document.getElementById('thisWeek');
    const newsItemsEl = document.getElementById('newsItems');
    
    if (totalScriptsEl) {
        animateCounter(totalScriptsEl, scripts.length);
    }
    
    // Count scripts from this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const thisWeekScripts = scripts.filter(script => {
        const scriptDate = new Date(script.createdAt);
        return scriptDate > oneWeekAgo;
    });
    
    if (thisWeekEl) {
        animateCounter(thisWeekEl, thisWeekScripts.length);
    }
    
    // Get news items count
    const savedNews = localStorage.getItem('zenuCuratedNews');
    const newsItems = savedNews ? JSON.parse(savedNews) : [];
    
    if (newsItemsEl) {
        animateCounter(newsItemsEl, newsItems.length);
    }
}

// Animate counter
function animateCounter(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Open script
function openScript(scriptId) {
    window.location.href = `script-editor.html?id=${scriptId}`;
}

// Add activity
function addActivity(icon, text) {
    const activities = JSON.parse(localStorage.getItem('zenuActivities') || '[]');
    
    activities.unshift({
        icon,
        text,
        time: 'Just now',
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 activities
    if (activities.length > 20) {
        activities.pop();
    }
    
    localStorage.setItem('zenuActivities', JSON.stringify(activities));
    loadActivity();
}

// Export function for use in other scripts
window.DashboardUtils = {
    addActivity,
    updateStats,
    loadScripts
};
