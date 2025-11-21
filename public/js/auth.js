// ==================== AUTH UTILITIES ====================
const API_BASE_URL = window.location.origin + '/api';

// Get token from localStorage
function getToken() {
  return localStorage.getItem('zenu_token');
}

// Set token in localStorage
function setToken(token) {
  localStorage.setItem('zenu_token', token);
}

// Remove token from localStorage
function removeToken() {
  localStorage.removeItem('zenu_token');
  localStorage.removeItem('zenu_user');
}

// Get user from localStorage
function getUser() {
  const userStr = localStorage.getItem('zenu_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Set user in localStorage
function setUser(user) {
  localStorage.setItem('zenu_user', JSON.stringify(user));
}

// Check if user is authenticated
function isAuthenticated() {
  return !!getToken();
}

// Redirect to login if not authenticated
function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
    return false;
  }
  return true;
}

// ==================== API CALLS ====================

// Register new user
async function register(name, email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store token and user
    setToken(data.token);
    setUser(data.user);

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Login user
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store token and user
    setToken(data.token);
    setUser(data.user);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Logout user
function logout() {
  removeToken();
  window.location.href = '/index.html';
}

// Get current user
async function getCurrentUser() {
  try {
    const token = getToken();
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user');
    }

    setUser(data.user);
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    removeToken();
    throw error;
  }
}

// ==================== UI HELPERS ====================

// Show error message
function showError(message, elementId = 'error-message') {
  const errorEl = document.getElementById(elementId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    errorEl.classList.add('animate-fade-in');
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorEl.style.display = 'none';
    }, 5000);
  } else {
    alert(message);
  }
}

// Show success message
function showSuccess(message, elementId = 'success-message') {
  const successEl = document.getElementById(elementId);
  if (successEl) {
    successEl.textContent = message;
    successEl.style.display = 'block';
    successEl.classList.add('animate-fade-in');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      successEl.style.display = 'none';
    }, 3000);
  } else {
    alert(message);
  }
}

// Show loading state
function showLoading(button) {
  if (button) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span> Loading...';
  }
}

// Hide loading state
function hideLoading(button) {
  if (button) {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

// ==================== FORM HANDLERS ====================

// Handle login form
if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
      showLoading(submitBtn);
      await login(email, password);
      
      // Check if onboarding is complete
      const profile = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      }).then(res => res.json());
      
      if (profile.data && profile.data.onboardingCompleted) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/onboarding';
      }
    } catch (error) {
      hideLoading(submitBtn);
      showError(error.message);
    }
  });
}

// Handle register form
if (document.getElementById('register-form')) {
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }
    
    try {
      showLoading(submitBtn);
      await register(name, email, password);
      
      // Redirect to onboarding
      window.location.href = '/onboarding';
    } catch (error) {
      hideLoading(submitBtn);
      showError(error.message);
    }
  });
}

// ==================== INITIALIZE ====================

// Check authentication on protected pages
document.addEventListener('DOMContentLoaded', () => {
  const protectedPages = ['/dashboard', '/onboarding', '/editor', '/teleprompter'];
  const currentPath = window.location.pathname;
  
  if (protectedPages.some(page => currentPath.includes(page))) {
    requireAuth();
  }
  
  // Display user info if logged in
  const user = getUser();
  if (user) {
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
      el.textContent = user.name;
    });
    
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    userAvatarElements.forEach(el => {
      el.textContent = user.name.charAt(0).toUpperCase();
    });
  }
});

// Export functions for use in other scripts
window.ZenuAuth = {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  isAuthenticated,
  requireAuth,
  register,
  login,
  logout,
  getCurrentUser,
  showError,
  showSuccess,
  showLoading,
  hideLoading,
  API_BASE_URL
};
