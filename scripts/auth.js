// ========================================
// ZENU - Authentication & Session Management
// ========================================

// Check authentication status
function isAuthenticated() {
    return localStorage.getItem('zenuAuthenticated') === 'true';
}

// Get user profile
function getUserProfile() {
    const profile = localStorage.getItem('zenuUserProfile');
    return profile ? JSON.parse(profile) : null;
}

// Set user profile
function setUserProfile(profile) {
    localStorage.setItem('zenuUserProfile', JSON.stringify(profile));
}

// Login user
function login(email, password) {
    // In a real app, this would make an API call
    // For demo purposes, we'll simulate authentication
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate successful login
            localStorage.setItem('zenuAuthenticated', 'true');
            localStorage.setItem('zenuUserEmail', email);
            
            resolve({
                success: true,
                message: 'Login successful'
            });
        }, 1000);
    });
}

// Logout user
function logout() {
    localStorage.removeItem('zenuAuthenticated');
    localStorage.removeItem('zenuUserProfile');
    localStorage.removeItem('zenuUserEmail');
    localStorage.removeItem('zenuOnboardingData');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Require authentication for protected pages
function requireAuth() {
    if (!isAuthenticated()) {
        // Redirect to onboarding
        window.location.href = 'onboarding.html';
        return false;
    }
    return true;
}

// Initialize user session
function initSession() {
    const profile = getUserProfile();
    
    if (profile) {
        // Update UI with user info
        updateUserUI(profile);
    }
}

// Update UI with user information
function updateUserUI(profile) {
    // Update user name displays
    const userNameElements = document.querySelectorAll('[data-user-name]');
    userNameElements.forEach(el => {
        el.textContent = profile.fullName || 'User';
    });
    
    // Update user email displays
    const userEmailElements = document.querySelectorAll('[data-user-email]');
    userEmailElements.forEach(el => {
        el.textContent = profile.email || '';
    });
    
    // Update show name displays
    const showNameElements = document.querySelectorAll('[data-show-name]');
    showNameElements.forEach(el => {
        el.textContent = profile.showName || 'My Show';
    });
}

// Save user preferences
function savePreferences(preferences) {
    const profile = getUserProfile();
    if (profile) {
        profile.preferences = {
            ...profile.preferences,
            ...preferences
        };
        setUserProfile(profile);
    }
}

// Get user preferences
function getPreferences() {
    const profile = getUserProfile();
    return profile?.preferences || {};
}

// Export functions for use in other scripts
window.ZenuAuth = {
    isAuthenticated,
    getUserProfile,
    setUserProfile,
    login,
    logout,
    requireAuth,
    initSession,
    updateUserUI,
    savePreferences,
    getPreferences
};

// Auto-initialize session on page load
document.addEventListener('DOMContentLoaded', function() {
    initSession();
});
