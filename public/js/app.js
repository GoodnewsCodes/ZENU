// ==================== DASHBOARD APPLICATION LOGIC ====================

const { API_BASE_URL, getToken, getUser, showError, showSuccess, showLoading, hideLoading } = window.ZenuAuth;

// ==================== STATE MANAGEMENT ====================
let currentProfile = null;
let recentScripts = [];
let selectedSources = ['vanguard', 'punch', 'arise'];
let isGenerating = false;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!window.ZenuAuth.requireAuth()) return;
  
  // Load dashboard data
  await loadDashboard();
  
  // Setup event listeners
  setupEventListeners();
});

// ==================== LOAD DASHBOARD DATA ====================
async function loadDashboard() {
  try {
    showPageLoading(true);
    
    // Load in parallel
    await Promise.all([
      loadProfile(),
      loadRecentScripts(),
      loadStats()
    ]);
    
    showPageLoading(false);
  } catch (error) {
    console.error('Dashboard load error:', error);
    showError('Failed to load dashboard data');
    showPageLoading(false);
  }
}

// ==================== LOAD PROFILE ====================
async function loadProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load profile');
    }
    
    currentProfile = data.data;
    
    // Update UI
    updateProfileDisplay();
    
    // Check if onboarding is complete
    if (!currentProfile.onboardingCompleted) {
      showOnboardingPrompt();
    }
    
    return currentProfile;
  } catch (error) {
    console.error('Load profile error:', error);
    throw error;
  }
}

// ==================== LOAD RECENT SCRIPTS ====================
async function loadRecentScripts() {
  try {
    const response = await fetch(`${API_BASE_URL}/skills/scripts`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to load scripts');
    }
    
    recentScripts = data.data || [];
    
    // Update UI
    displayRecentScripts();
    
    return recentScripts;
  } catch (error) {
    console.error('Load scripts error:', error);
    // Don't throw - scripts are optional
    recentScripts = [];
    displayRecentScripts();
  }
}

// ==================== LOAD STATS ====================
async function loadStats() {
  try {
    // Calculate stats from recent scripts
    const totalScripts = recentScripts.length;
    const timeSaved = totalScripts * 45; // 45 minutes saved per script
    const readyScripts = recentScripts.filter(s => s.status === 'ready' || s.status === 'delivered').length;
    
    // Update stats display
    updateStatsDisplay({
      totalScripts,
      timeSaved,
      readyScripts,
      avgGenerationTime: 30 // seconds
    });
  } catch (error) {
    console.error('Load stats error:', error);
  }
}

// ==================== GENERATE SCRIPT (MAIN WORKFLOW) ====================
async function generateScript() {
  if (isGenerating) return;
  
  try {
    isGenerating = true;
    
    // Validate profile
    if (!currentProfile || !currentProfile.onboardingCompleted) {
      showError('Please complete your profile onboarding first');
      window.location.href = '/onboarding';
      return;
    }
    
    // Validate sources
    if (selectedSources.length === 0) {
      showError('Please select at least one news source');
      isGenerating = false;
      return;
    }
    
    const generateBtn = document.getElementById('generate-btn');
    showLoading(generateBtn);
    
    // Show progress modal
    showProgressModal();
    
    // Call complete workflow API
    const response = await fetch(`${API_BASE_URL}/skills/complete-workflow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sources: selectedSources,
        categories: [],
        limit: 10,
        deliveryMethod: ['ui']
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate script');
    }
    
    // Success!
    hideProgressModal();
    hideLoading(generateBtn);
    
    showSuccess(`Script generated successfully! ${data.stats?.newsItemsFetched || 0} news items processed.`);
    
    // Redirect to editor
    setTimeout(() => {
      window.location.href = `/editor?scriptId=${data.scriptId}`;
    }, 1500);
    
  } catch (error) {
    console.error('Generate script error:', error);
    hideProgressModal();
    const generateBtn = document.getElementById('generate-btn');
    hideLoading(generateBtn);
    showError(error.message);
  } finally {
    isGenerating = false;
  }
}

// ==================== NEWS SOURCE SELECTION ====================
function toggleNewsSource(source) {
  const index = selectedSources.indexOf(source);
  
  if (index > -1) {
    selectedSources.splice(index, 1);
  } else {
    selectedSources.push(source);
  }
  
  updateSourceChips();
}

function updateSourceChips() {
  const chips = document.querySelectorAll('.news-source-chip');
  chips.forEach(chip => {
    const source = chip.dataset.source;
    chip.classList.toggle('active', selectedSources.includes(source));
  });
}

// ==================== UI UPDATE FUNCTIONS ====================

function updateProfileDisplay() {
  if (!currentProfile) return;
  
  // Profile completeness
  const completenessEl = document.getElementById('profile-completeness');
  if (completenessEl) {
    const completeness = calculateProfileCompleteness(currentProfile);
    completenessEl.textContent = `${completeness}%`;
    completenessEl.style.color = completeness === 100 ? 'var(--color-success)' : 'var(--color-warning)';
  }
  
  // Speaking speed
  const speedEl = document.getElementById('speaking-speed');
  if (speedEl) {
    speedEl.textContent = currentProfile.speakingSpeed || 'medium';
  }
  
  // Languages
  const langEl = document.getElementById('preferred-languages');
  if (langEl) {
    langEl.textContent = currentProfile.preferredLanguage?.join(', ') || 'English';
  }
}

function displayRecentScripts() {
  const container = document.getElementById('recent-scripts-list');
  if (!container) return;
  
  if (recentScripts.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: var(--spacing-xl); color: var(--color-text-muted);">
        <p>No scripts yet. Generate your first script to get started!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = recentScripts.map(script => `
    <div class="script-item" onclick="openScript('${script._id}')">
      <div class="script-item-header">
        <span class="script-item-title">${script.title || 'Untitled Script'}</span>
        <span class="script-item-date">${formatDate(script.createdAt)}</span>
      </div>
      <div class="script-item-meta">
        <span class="script-item-badge ${script.status}">${script.status}</span>
        <span>${script.teleprompterScript?.chunks?.length || 0} chunks</span>
      </div>
    </div>
  `).join('');
}

function updateStatsDisplay(stats) {
  // Total scripts
  const totalEl = document.getElementById('stat-total-scripts');
  if (totalEl) totalEl.textContent = stats.totalScripts;
  
  // Time saved
  const timeEl = document.getElementById('stat-time-saved');
  if (timeEl) timeEl.textContent = `${stats.timeSaved} min`;
  
  // Ready scripts
  const readyEl = document.getElementById('stat-ready-scripts');
  if (readyEl) readyEl.textContent = stats.readyScripts;
  
  // Avg generation time
  const avgEl = document.getElementById('stat-avg-time');
  if (avgEl) avgEl.textContent = `${stats.avgGenerationTime}s`;
}

// ==================== PROGRESS MODAL ====================
function showProgressModal() {
  const modal = document.getElementById('progress-modal');
  if (modal) {
    modal.style.display = 'flex';
    animateProgress();
  }
}

function hideProgressModal() {
  const modal = document.getElementById('progress-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function animateProgress() {
  const steps = [
    { text: 'Fetching news from sources...', duration: 3000 },
    { text: 'Cleaning and summarizing...', duration: 5000 },
    { text: 'Rewriting in your tone...', duration: 7000 },
    { text: 'Populating show template...', duration: 4000 },
    { text: 'Generating teleprompter script...', duration: 3000 },
    { text: 'Finalizing...', duration: 2000 }
  ];
  
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  
  if (!progressText || !progressBar) return;
  
  let currentStep = 0;
  let totalDuration = steps.reduce((sum, step) => sum + step.duration, 0);
  let elapsed = 0;
  
  const interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      return;
    }
    
    const step = steps[currentStep];
    progressText.textContent = step.text;
    
    elapsed += step.duration;
    const percentage = (elapsed / totalDuration) * 100;
    progressBar.style.width = `${percentage}%`;
    
    currentStep++;
  }, steps[currentStep]?.duration || 1000);
}

// ==================== HELPER FUNCTIONS ====================

function calculateProfileCompleteness(profile) {
  const fields = [
    'preferredLanguage',
    'speakingSpeed',
    'signatureIntro',
    'signatureOutro',
    'topicPreferences',
    'showStructure'
  ];
  
  let completed = 0;
  fields.forEach(field => {
    const value = profile[field];
    if (value && (Array.isArray(value) ? value.length > 0 : value !== '')) {
      completed++;
    }
  });
  
  return Math.round((completed / fields.length) * 100);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

function showPageLoading(show) {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
}

function showOnboardingPrompt() {
  const prompt = document.getElementById('onboarding-prompt');
  if (prompt) {
    prompt.style.display = 'block';
  }
}

function openScript(scriptId) {
  window.location.href = `/editor?scriptId=${scriptId}`;
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
  // Generate script button
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', generateScript);
  }
  
  // News source chips
  const sourceChips = document.querySelectorAll('.news-source-chip');
  sourceChips.forEach(chip => {
    chip.addEventListener('click', () => {
      toggleNewsSource(chip.dataset.source);
    });
  });
  
  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDashboard);
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', window.ZenuAuth.logout);
  }
}

// ==================== EXPORT ====================
window.ZenuDashboard = {
  loadDashboard,
  generateScript,
  loadProfile,
  loadRecentScripts,
  toggleNewsSource,
  openScript
};
