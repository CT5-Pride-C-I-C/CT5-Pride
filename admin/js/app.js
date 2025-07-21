// CT5 Pride Admin SPA - app.js
// Handles hash-based routing, authentication, and view switching

console.log('🚀 CT5 PRIDE ADMIN - app.js starting initialization');
console.log('🚀 SCRIPT LOAD DEBUG - app.js has loaded successfully');
console.log('🚀 SCRIPT LOAD DEBUG - Current URL:', window.location.href);

// Add error handler for unhandled errors
window.addEventListener('error', (e) => {
  console.error('Unhandled error:', e.error);
  const app = document.getElementById('app');
  if (app && !app.innerHTML.trim()) {
    app.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #e91e63;">
        <h2>⚠️ Application Error</h2>
        <p>There was an error loading the admin dashboard.</p>
        <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; text-align: left; margin: 1rem 0;">
          ${e.error?.message || 'Unknown error'}
        </pre>
        <button onclick="window.location.reload()" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
});

const SUPABASE_URL = 'https://rmhnrpwbgxyslfwttwzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaG5ycHdiZ3h5c2xmd3R0d3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQyMDcsImV4cCI6MjA2ODY5MDIwN30.yNlkzFMfvUCoN6IwEY4LgL6_ihdR_ux22oqvDnkWTxg';

// Ensure Supabase is available
if (!window.supabase) {
  console.error('Supabase not loaded! Check CDN connection.');
  document.getElementById('app').innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #f44336;">
      <h2>⚠️ Supabase Not Loaded</h2>
      <p>The Supabase library failed to load. Please check your connection and try again.</p>
      <button onclick="window.location.reload()" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
  throw new Error('Supabase library not available');
}

// Initialize Supabase client - CRITICAL: Must be available before OAuth handling
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized successfully');

// Global state
let currentUser = null;
let roles = [];
let applications = [];
let events = [];
let analytics = {};

// Navigation state
const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'roles', label: 'Role Management', icon: '👥' },
  { id: 'events', label: 'Event Management', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📈' }
];

// ==================== AUTHENTICATION & SESSION MANAGEMENT ====================

function getSession() {
  return localStorage.getItem('ct5pride_admin_token');
}

function setSession(token) {
  localStorage.setItem('ct5pride_admin_token', token);
}

function clearSession() {
  localStorage.removeItem('ct5pride_admin_token');
  currentUser = null;
}

async function validateSession() {
  const token = getSession();
  if (!token) return false;
  
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      clearSession();
      return false;
    }
    currentUser = data.user;
    return true;
  } catch (err) {
    console.error('Session validation error:', err);
    clearSession();
    return false;
  }
}

function getAuthHeaders() {
  const token = getSession();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function handleLogout() {
  console.log('Logging out user...');
  try {
    // Clear Supabase session
    await supabase.auth.signOut();
    
    // Clear all local storage
    clearSession();
    localStorage.removeItem("supabaseSession");
    
    console.log('Logout successful, redirecting to login');
    showSuccess('Logged out successfully.');
    window.location.hash = '#/login';
    route(); // Ensure route is called
  } catch (err) {
    console.error('Logout error:', err);
    // Clear local storage even if Supabase logout fails
    clearSession();
    localStorage.removeItem("supabaseSession");
    window.location.hash = '#/login';
    route();
  }
}

// ==================== ERROR HANDLING UTILITIES ====================

function showError(message, includeEmailFallback = true) {
  const app = document.getElementById('app');
  if (!app) return;
  
  const fallbackButtons = includeEmailFallback ? `
    <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
      <button onclick="window.location.hash='#/login'; location.reload();" 
              style="background: #e91e63; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
        Try GitHub Again
      </button>
      <button onclick="window.location.hash='#/login'; location.reload();" 
              style="background: transparent; color: #e91e63; border: 2px solid #e91e63; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
        Log in with Email Instead
      </button>
    </div>
  ` : `
    <button onclick="window.location.hash='#/login'; location.reload();" 
            style="background: #e91e63; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1.5rem;">
      Back to Login
    </button>
  `;
  
  app.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #e74c3c;">
      <h2>🔐 Authentication Error</h2>
      <p>${message}</p>
      ${fallbackButtons}
      ${includeEmailFallback ? '<p style="margin-top: 1rem; font-size: 0.875rem; color: #666;">You can try GitHub or email login.</p>' : ''}
    </div>
  `;
}

// ==================== API UTILITIES ====================

async function apiRequest(endpoint, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    }
  };
  
  console.log(`API Request: ${options.method || 'GET'} ${endpoint}`, {
    hasToken: !!getSession(),
    headers: defaultOptions.headers
  });
  
  try {
    const response = await fetch(endpoint, { ...defaultOptions, ...options });
    
    console.log(`API Response: ${response.status} ${response.statusText} for ${endpoint}`);
    
    if (response.status === 401) {
      console.log('401 Unauthorized - clearing session and redirecting to login');
      clearSession();
      window.location.hash = '#/login';
      throw new Error('Authentication required');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`API Error ${response.status}:`, data);
      throw new Error(data.message || `HTTP ${response.status}`);
    }
    
    console.log(`API Success for ${endpoint}:`, data);
    return data;
  } catch (err) {
    console.error('API request failed:', err);
    throw err;
  }
}

// ==================== ROUTER ====================

function route() {
  const hash = window.location.hash || '#/login';
  const app = document.getElementById('app');
  
  console.log('=== ROUTE HANDLER CALLED ===');
  console.log('🔍 Route hash:', hash);
  console.log('🔍 Authentication state:', {
    hasUser: !!currentUser,
    hasToken: !!getSession(),
    userEmail: currentUser?.email || 'None',
    isAuthenticated: isAuthenticated()
  });
  
  // Set focus for accessibility
  try {
    app.focus();
  } catch (e) {
    console.warn('Focus failed:', e.message);
  }
  
  // Handle login route
  if (hash === '#/login') {
    console.log('✅ Rendering login page');
    try {
      renderLogin();
    } catch (error) {
      console.error('❌ Login render failed:', error);
      app.innerHTML = `
        <div class="loading-container">
          <h2 style="color: #f44336;">❌ Login Page Error</h2>
          <p>Failed to load login page: ${error.message}</p>
          <button onclick="location.reload()" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    }
    return;
  }
  
  // All other routes require authentication
  if (!requireAuth()) {
    console.log('🔒 Authentication required, redirecting...');
    return; // requireAuth handles the redirect
  }
  
  // Set enhanced loading state for authenticated routes
  app.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <h2>🏳️‍🌈 Loading ${hash.replace('#/', '').toUpperCase()}</h2>
      <p>Preparing your dashboard content...</p>
    </div>
  `;
  
  switch (hash) {
    case '#/dashboard':
      console.log('✓ Rendering dashboard for authenticated user');
      console.log('✓ Current user:', currentUser?.email || 'Unknown');
      renderDashboard();
      break;
    case '#/roles':
      console.log('✓ Rendering roles page for authenticated user');
      renderRoles();
      break;
    case '#/events':
      console.log('✓ Rendering events page for authenticated user');
      renderEvents();
      break;
    case '#/analytics':
      console.log('✓ Rendering analytics page for authenticated user');
      renderAnalytics();
      break;
    default:
      console.log('❌ Unknown route, rendering 404');
      renderNotFound();
  }
}

// ==================== UTILITY FUNCTIONS ====================

function showLoading(container, message = 'Loading...') {
  container.innerHTML = `
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>${message}</p>
    </div>
  `;
}

function showError(container, message) {
  container.innerHTML = `
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Error</h3>
      <p>${message}</p>
    </div>
  `;
}

function showSuccess(message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.className = 'toast toast-success toast-show';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">✅</div>
      <div class="toast-message">${message}</div>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function formatDate(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// ==================== LOGIN VIEW ====================

function renderLogin() {
  console.log('🔐 LOGIN DEBUG - Rendering login page...');
  console.log('🔐 LOGIN DEBUG - renderLogin function called');
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('App container not found in renderLogin!');
    return;
  }
  
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/Images/Logo-with-Transparent-background.svg" alt="CT5 Pride Logo">
          <h1>Admin Login</h1>
          <p>Access the CT5 Pride admin dashboard</p>
        </div>
        
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              autocomplete="email"
              aria-describedby="email-error"
            >
            <div id="email-error" class="error-message" role="alert"></div>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              autocomplete="current-password"
              aria-describedby="password-error"
            >
            <div id="password-error" class="error-message" role="alert"></div>
          </div>
          
          <button type="submit" class="btn btn-primary btn-login">
            <span class="btn-text">Sign In</span>
            <span class="btn-spinner" style="display: none;">Signing in...</span>
          </button>
        </form>
        <div class="oauth-divider"><span>or</span></div>
        <button id="github-login-btn" class="btn btn-github" type="button" aria-label="Login with GitHub">
          <svg class="github-icon" xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 21.13V24"/></svg>
          <span>Login with GitHub</span>
        </button>
        <div class="login-footer">
          <p>Secure login powered by Supabase Auth</p>
          <p class="login-options-info">
            💡 You can log in with either your email/password or GitHub account. 
            If one method fails, try the other!
          </p>
        </div>
      </div>
    </div>
  `;
  
  // Add form submission handler
  console.log('🔐 LOGIN DEBUG - Adding form submission handler');
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
  // Add GitHub OAuth handler
  console.log('🔐 LOGIN DEBUG - Adding GitHub OAuth button handler');
  const githubBtn = document.getElementById('github-login-btn');
  if (githubBtn) {
    console.log('🔐 LOGIN DEBUG - GitHub button found, attaching click handler');
    githubBtn.addEventListener('click', handleGitHubLogin);
  } else {
    console.error('❌ LOGIN ERROR - GitHub button not found!');
  }
  
  // Focus on email field
  setTimeout(() => {
    document.getElementById('email').focus();
  }, 100);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const form = e.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  const submitBtn = form.querySelector('.btn-login');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');
  const errorDiv = document.getElementById('login-error');
  
  // Clear previous errors
  if (errorDiv) errorDiv.textContent = '';
  
  // Show loading state
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';
  submitBtn.disabled = true;
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setSession(data.token);
      currentUser = data.user;
      showSuccess('Login successful! Welcome to the admin dashboard.');
      window.location.hash = '#/dashboard';
    } else {
      if (errorDiv) errorDiv.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    if (errorDiv) errorDiv.textContent = 'Login failed. Please check your connection and try again.';
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    submitBtn.disabled = false;
  }
}

async function handleGitHubLogin() {
  console.log('🎯 CLICK DEBUG - GitHub button clicked!');
  console.log('🎯 CLICK DEBUG - handleGitHubLogin function called');
  
  try {
    console.log('🎯 GITHUB OAUTH DEBUG - Initiating GitHub OAuth login...');
    
    // Debug the redirect URL being used
    const redirectUrl = `${window.location.origin}/admin/`;
    console.log('🔍 GITHUB OAUTH DEBUG - Redirect URL being requested:', redirectUrl);
    console.log('🔍 GITHUB OAUTH DEBUG - window.location.origin:', window.location.origin);
    console.log('🔍 GITHUB OAUTH DEBUG - Current page URL:', window.location.href);
    
    // Show loading state
    const githubBtn = document.querySelector('.btn-github');
    if (githubBtn) {
      githubBtn.innerHTML = '🔄 Connecting to GitHub...';
      githubBtn.disabled = true;
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: redirectUrl
      }
    });
    
    if (error) {
      console.error('GitHub login error:', error);
      showError(document.getElementById('app'), 'GitHub login failed: ' + error.message);
      
      // Reset button state
      if (githubBtn) {
        githubBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> Continue with GitHub';
        githubBtn.disabled = false;
      }
    } else {
      console.log('GitHub OAuth initiated successfully - redirecting...');
      // OAuth redirect should happen automatically
    }
  } catch (err) {
    console.error('GitHub login error:', err);
    showError(document.getElementById('app'), 'GitHub login failed. Please try again.');
    
    // Reset button state
    const githubBtn = document.querySelector('.btn-github');
    if (githubBtn) {
      githubBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> Continue with GitHub';
      githubBtn.disabled = false;
    }
  }
}

// ==================== NAVIGATION COMPONENT ====================

function renderNavigation(currentView) {
  return `
    <nav class="admin-nav" role="navigation" aria-label="Admin navigation">
      <div class="nav-header">
        <h2>Admin Dashboard</h2>
        <div class="user-info">
          <span class="user-email">${currentUser?.email || 'Admin'}</span>
          <button class="logout-btn" onclick="handleLogout()" title="Logout">
            <span class="logout-icon">🚪</span>
            <span class="logout-text">Logout</span>
          </button>
        </div>
      </div>
      <ul class="nav-links">
        ${navigation.map(item => `
          <li>
            <a 
              href="#/${item.id}" 
              class="nav-link ${currentView === item.id ? 'active' : ''}"
              aria-current="${currentView === item.id ? 'page' : 'false'}"
            >
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>
  `;
}

// Global function for logout button
window.handleLogout = handleLogout;

// ==================== DASHBOARD VIEW ====================

async function renderDashboard() {
  console.log('=== RENDERING DASHBOARD ===');
  console.log('✓ User authenticated:', !!currentUser);
  console.log('✓ User email:', currentUser?.email || 'No email');
  
  const app = document.getElementById('app');
  
  if (!app) {
    console.error('❌ App container not found in renderDashboard!');
    return;
  }
  
  console.log('✓ App container found, rendering dashboard...');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('dashboard')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Dashboard</h1>
          <p>Overview of CT5 Pride volunteer management system</p>
        </div>
        
        <!-- Welcome Section -->
        <div class="welcome-section">
          <div class="user-info">
            <div class="user-avatar">
              ${currentUser?.user_metadata?.avatar_url ? 
                `<img src="${currentUser.user_metadata.avatar_url}" alt="User Avatar" class="avatar-img">` : 
                '<div class="avatar-placeholder">👤</div>'}
            </div>
            <div class="user-details">
              <h2>Welcome, ${currentUser?.user_metadata?.full_name || currentUser?.user_metadata?.name || currentUser?.email || 'Admin'}!</h2>
              <p>Logged in as: <strong>${currentUser?.email}</strong></p>
              <p>Authentication: <span class="auth-provider">${currentUser?.app_metadata?.provider?.toUpperCase() || 'EMAIL'}</span></p>
            </div>
          </div>
        </div>
        
        <div id="dashboard-content" class="dashboard-grid">
          <!-- Content will be loaded here -->
        </div>
      </main>
    </div>
  `;
  
  const content = document.getElementById('dashboard-content');
  showLoading(content, 'Loading dashboard data...');
  
  try {
    // Fetch all dashboard data
    const [analyticsResponse, rolesResponse, applicationsResponse] = await Promise.all([
      apiRequest('/api/analytics'),
      apiRequest('/api/roles'),
      apiRequest('/api/applications')
    ]);
    
    analytics = analyticsResponse.analytics;
    roles = rolesResponse.roles;
    applications = applicationsResponse.applications;
    
    // Render dashboard cards
    content.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Total Roles</h3>
            <div class="stat-number">${analytics.totalRoles}</div>
            <p class="stat-description">Active volunteer positions</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-content">
            <h3>Total Applications</h3>
            <div class="stat-number">${analytics.totalApplications}</div>
            <p class="stat-description">All time submissions</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <h3>Recent Applications</h3>
            <div class="stat-number">${analytics.recentApplications}</div>
            <p class="stat-description">Last 30 days</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Active Roles</h3>
            <div class="stat-number">${roles.filter(r => r.status === 'open').length}</div>
            <p class="stat-description">Currently recruiting</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <div class="dashboard-section">
          <h2>Recent Applications</h2>
          <div class="recent-applications">
            ${applications.slice(0, 5).map(app => `
              <div class="application-item">
                <div class="application-info">
                  <strong>${app.full_name}</strong>
                  <span class="application-role">${app.roles?.title || 'Unknown Role'}</span>
                </div>
                <div class="application-meta">
                  <span class="application-date">${formatDate(app.submitted_at)}</span>
                  <span class="application-status status-${app.status || 'pending'}">${app.status || 'pending'}</span>
                </div>
              </div>
            `).join('') || '<p>No applications yet</p>'}
          </div>
          <a href="#/applications" class="view-all-link">View all applications →</a>
        </div>
        
        <div class="dashboard-section">
          <h2>Quick Actions</h2>
          <div class="quick-actions">
            <a href="#/roles" class="action-card">
              <div class="action-icon">➕</div>
              <div class="action-content">
                <h3>Add New Role</h3>
                <p>Create a new volunteer position</p>
              </div>
            </a>
            <a href="#/events" class="action-card">
              <div class="action-icon">🔄</div>
              <div class="action-content">
                <h3>Sync Events</h3>
                <p>Import from Eventbrite</p>
              </div>
            </a>
            <a href="#/analytics" class="action-card">
              <div class="action-icon">📊</div>
              <div class="action-content">
                <h3>View Reports</h3>
                <p>Detailed analytics</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Dashboard load error:', err);
    showError(content, err.message);
  }
}

// ==================== ROLES VIEW ====================

async function renderRoles() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('roles')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Role Management</h1>
          <p>Manage volunteer positions and recruitment</p>
          <button class="btn btn-primary" onclick="openRoleModal()">Add New Role</button>
        </div>
        <div id="roles-content" class="roles-container">
          <!-- Content will be loaded here -->
        </div>
      </main>
    </div>
  `;
  
  await loadRoles();
}

async function loadRoles() {
  const content = document.getElementById('roles-content');
  showLoading(content, 'Loading roles...');
  
  try {
    const response = await apiRequest('/api/roles');
    roles = response.roles;
    
    if (roles.length === 0) {
      content.innerHTML = `
        <div class="no-data">
          <h3>No roles found</h3>
          <p>Start by creating your first volunteer role.</p>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="roles-grid">
        ${roles.map(role => `
          <div class="role-card">
            <div class="role-header">
              <h3>${role.title}</h3>
              <span class="role-status status-${role.status || 'draft'}">${role.status || 'draft'}</span>
            </div>
            <div class="role-details">
              <p><strong>Department:</strong> ${role.department || 'Not specified'}</p>
              <p><strong>Posted:</strong> ${formatDate(role.posted_date)}</p>
              <p><strong>Location:</strong> ${role.location || 'Remote/Flexible'}</p>
            </div>
            <div class="role-summary">
              ${role.summary || role.description || 'No description available'}
            </div>
            <div class="role-actions">
              <button class="btn btn-sm btn-secondary" onclick="editRole(${role.id})">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteRole(${role.id})">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Roles load error:', err);
    showError(content, err.message);
  }
}

function openRoleModal(roleId = null) {
  const isEdit = roleId !== null;
  const role = isEdit ? roles.find(r => r.id === roleId) : {};
  
  // Modal implementation here - simplified for space
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Role' : 'Add New Role'}</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <form class="modal-form" onsubmit="handleRoleSubmit(event, ${roleId})">
        <div class="form-group">
          <label>Title</label>
          <input type="text" name="title" value="${role.title || ''}" required>
        </div>
        <div class="form-group">
          <label>Department</label>
          <input type="text" name="department" value="${role.department || ''}">
        </div>
        <div class="form-group">
          <label>Summary</label>
          <textarea name="summary" rows="3">${role.summary || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select name="status">
            <option value="draft" ${role.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="open" ${role.status === 'open' ? 'selected' : ''}>Open</option>
            <option value="closed" ${role.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Role</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function handleRoleSubmit(event, roleId) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const roleData = Object.fromEntries(formData.entries());
  
  try {
    const endpoint = roleId ? `/api/roles/${roleId}` : '/api/roles';
    const method = roleId ? 'PUT' : 'POST';
    
    await apiRequest(endpoint, {
      method,
      body: JSON.stringify(roleData)
    });
    
    showSuccess(roleId ? 'Role updated successfully!' : 'Role created successfully!');
    document.querySelector('.modal-overlay').remove();
    await loadRoles();
  } catch (err) {
    console.error('Role save error:', err);
    showError(form, err.message);
  }
}

async function editRole(roleId) {
  openRoleModal(roleId);
}

async function deleteRole(roleId) {
  if (!confirm('Are you sure you want to delete this role?')) return;
  
  try {
    await apiRequest(`/api/roles/${roleId}`, { method: 'DELETE' });
    showSuccess('Role deleted successfully!');
    await loadRoles();
  } catch (err) {
    console.error('Role delete error:', err);
    showError(document.getElementById('roles-content'), err.message);
  }
}

// Global functions for role management
window.openRoleModal = openRoleModal;
window.handleRoleSubmit = handleRoleSubmit;
window.editRole = editRole;
window.deleteRole = deleteRole;

// ==================== EVENTS VIEW ====================

async function renderEvents() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('events')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Event Management</h1>
          <p>Sync and manage events from Eventbrite</p>
          <button class="btn btn-primary" onclick="openSyncEventModal()">Sync New Event</button>
        </div>
        <div id="events-content" class="events-container">
          <!-- Content will be loaded here -->
        </div>
      </main>
    </div>
  `;
  
  await loadEvents();
}

async function loadEvents() {
  const content = document.getElementById('events-content');
  showLoading(content, 'Loading events...');
  
  try {
    const response = await apiRequest('/api/events');
    events = response.events;
    
    if (events.length === 0) {
      content.innerHTML = `
        <div class="no-data">
          <h3>No events found</h3>
          <p>Sync events from Eventbrite to get started.</p>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="events-grid">
        ${events.map(event => `
          <div class="event-card">
            <div class="event-header">
              <h3>${event.name}</h3>
            </div>
            <div class="event-details">
              <p><strong>Date:</strong> ${formatDate(event.start_date)}</p>
              <p><strong>Location:</strong> ${event.location || 'Online'}</p>
              <p><strong>Status:</strong> ${event.status || 'Live'}</p>
            </div>
            <div class="event-summary">
              ${event.description || 'No description available'}
            </div>
            <div class="event-actions">
              <a href="${event.url}" target="_blank" class="btn btn-sm btn-secondary">View on Eventbrite</a>
              <button class="btn btn-sm btn-danger" onclick="deleteEvent(${event.id})">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    console.error('Events load error:', err);
    showError(content, err.message);
  }
}

function openSyncEventModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h2>Sync Event from Eventbrite</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <form class="modal-form" onsubmit="handleSyncEvent(event)">
        <div class="form-group">
          <label>Eventbrite Event URL or ID</label>
          <input type="text" name="eventInput" placeholder="https://www.eventbrite.com/e/event-name-123456789" required>
          <small>Enter the full Eventbrite URL or just the event ID</small>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          <button type="submit" class="btn btn-primary">Sync Event</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
}

async function handleSyncEvent(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const eventInput = formData.get('eventInput');
  
  try {
    await apiRequest('/api/events/sync', {
      method: 'POST',
      body: JSON.stringify({ eventInput })
    });
    
    showSuccess('Event synced successfully!');
    document.querySelector('.modal-overlay').remove();
    await loadEvents();
  } catch (err) {
    console.error('Event sync error:', err);
    showError(form, err.message);
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to remove this event from the local list?')) return;
  
  try {
    await apiRequest(`/api/events/${eventId}`, { method: 'DELETE' });
    showSuccess('Event removed successfully!');
    await loadEvents();
  } catch (err) {
    console.error('Event delete error:', err);
    showError(document.getElementById('events-content'), err.message);
  }
}

// Global functions for event management
window.openSyncEventModal = openSyncEventModal;
window.handleSyncEvent = handleSyncEvent;
window.deleteEvent = deleteEvent;

// ==================== ANALYTICS VIEW ====================

async function renderAnalytics() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('analytics')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Analytics</h1>
          <p>Detailed insights into volunteer applications and role performance</p>
        </div>
        <div id="analytics-content" class="analytics-container">
          <!-- Content will be loaded here -->
        </div>
      </main>
    </div>
  `;
  
  await loadAnalytics();
}

async function loadAnalytics() {
  const content = document.getElementById('analytics-content');
  showLoading(content, 'Loading analytics...');
  
  try {
    const response = await apiRequest('/api/analytics');
    analytics = response.analytics;
    
    content.innerHTML = `
      <div class="analytics-grid">
        <div class="analytics-section">
          <h2>Application Status Distribution</h2>
          <div class="chart-container">
            <canvas id="statusChart"></canvas>
          </div>
        </div>
        
        <div class="analytics-section">
          <h2>Applications by Role</h2>
          <div class="chart-container">
            <canvas id="roleChart"></canvas>
          </div>
        </div>
        
        <div class="performance-grid">
          <div class="performance-card">
            <h3>Most Popular Role</h3>
            <p>${getMostPopularRole()}</p>
          </div>
          <div class="performance-card">
            <h3>Application Rate</h3>
            <p>${calculateApplicationRate()}</p>
          </div>
          <div class="performance-card">
            <h3>Response Rate</h3>
            <p>${calculateResponseRate()}</p>
          </div>
        </div>
      </div>
    `;
    
    // Render charts
    renderStatusChart();
    renderRoleChart();
  } catch (err) {
    console.error('Analytics load error:', err);
    showError(content, err.message);
  }
}

function renderStatusChart() {
  const ctx = document.getElementById('statusChart');
  if (!ctx || !analytics.applicationsByStatus) return;
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Accepted', 'Rejected'],
      datasets: [{
        data: [
          analytics.applicationsByStatus.pending || 0,
          analytics.applicationsByStatus.accepted || 0,
          analytics.applicationsByStatus.rejected || 0
        ],
        backgroundColor: ['#ffc75f', '#2ecc71', '#e74c3c']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function renderRoleChart() {
  const ctx = document.getElementById('roleChart');
  if (!ctx || !analytics.applicationsByRole) return;
  
  const roleData = analytics.applicationsByRole;
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(roleData),
      datasets: [{
        label: 'Applications',
        data: Object.values(roleData),
        backgroundColor: '#ff6f91'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function getMostPopularRole() {
  if (!analytics.applicationsByRole) return 'No data';
  
  const roles = analytics.applicationsByRole;
  const maxRole = Object.keys(roles).reduce((a, b) => roles[a] > roles[b] ? a : b, '');
  return maxRole || 'No applications yet';
}

function calculateApplicationRate() {
  if (!analytics.totalApplications || !analytics.totalRoles) return '0 apps/role';
  
  const rate = (analytics.totalApplications / analytics.totalRoles).toFixed(1);
  return `${rate} apps/role`;
}

function calculateResponseRate() {
  if (!analytics.applicationsByStatus) return '0%';
  
  const total = Object.values(analytics.applicationsByStatus).reduce((a, b) => a + b, 0);
  const responded = (analytics.applicationsByStatus.accepted || 0) + (analytics.applicationsByStatus.rejected || 0);
  
  if (total === 0) return '0%';
  
  const rate = ((responded / total) * 100).toFixed(1);
  return `${rate}%`;
}

// ==================== 404 NOT FOUND VIEW ====================

function renderNotFound() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="admin-layout">
      ${getSession() ? renderNavigation('') : ''}
      <main class="admin-content">
        <div class="not-found-container">
          <div class="not-found-content">
            <h1>404 - Page Not Found</h1>
            <p>The page you're looking for doesn't exist in the admin dashboard.</p>
            <div class="not-found-actions">
              <a href="#/dashboard" class="btn btn-primary">Go to Dashboard</a>
              <a href="../" class="btn btn-secondary">Go to Main Site</a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `;
}

// ==================== APP INITIALIZATION ====================

// Initialize the app
window.addEventListener('hashchange', route);

// Session management helper functions
function isAuthenticated() {
  return !!currentUser && !!getSession();
}

// Enhanced route protection
function requireAuth() {
  if (!isAuthenticated()) {
    console.log('Authentication required, redirecting to login');
    window.location.hash = '#/login';
    return false;
  }
  return true;
}

// Enhanced OAuth redirect handler - SIMPLIFIED AND ROBUST
window.addEventListener("DOMContentLoaded", async () => {
  console.log('=== CT5 PRIDE ADMIN INITIALIZATION ===');
  console.log('🚀 App starting at:', new Date().toISOString());
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('❌ CRITICAL: App container not found!');
    return;
  }
  
  // Loading state helper
  function showLoadingState(message = 'Loading admin dashboard...') {
    app.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <h2>🏳️‍🌈 ${message}</h2>
        <p>Please wait while we set up your dashboard.</p>
      </div>
    `;
  }
  
  showLoadingState('Initializing authentication...');
  
  // Add a timeout fallback to prevent infinite loading
  setTimeout(() => {
    console.log('⚠️ TIMEOUT DEBUG - Checking if still loading after 10 seconds...');
    const loadingElement = document.querySelector('.loading-container');
    if (loadingElement) {
      console.log('⚠️ TIMEOUT DEBUG - Still showing loading screen, forcing route...');
      const currentHash = window.location.hash;
      console.log('⚠️ TIMEOUT DEBUG - Current hash:', currentHash);
      
      if (!currentHash || currentHash === '#/' || currentHash === '#/login') {
        window.location.hash = '#/login';
        route();
      }
    }
  }, 10000);
  
  try {
    // ========== STEP 1: OAUTH TOKEN PROCESSING ==========
    const hash = window.location.hash;
    console.log('🔍 OAUTH DEBUG - Checking URL for OAuth tokens...');
    console.log('📍 OAUTH DEBUG - Current URL:', window.location.href);
    console.log('📍 OAUTH DEBUG - Hash:', hash);
    console.log('📍 OAUTH DEBUG - Hash length:', hash.length);
    console.log('📍 OAUTH DEBUG - Contains access_token:', hash.includes('access_token'));
    
    // Log all URL parameters for debugging
    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      console.log('📍 OAUTH DEBUG - All hash parameters:');
      for (const [key, value] of hashParams) {
        const displayValue = key.includes('token') ? value.substring(0, 20) + '...' : value;
        console.log(`  ${key}: ${displayValue}`);
      }
    }
    
    if (hash && hash.includes("access_token")) {
      console.log('✅ GitHub OAuth redirect detected!');
      
      // Extract OAuth tokens from URL hash
      const hashParams = new URLSearchParams(hash.substring(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");
      const expires_in = hashParams.get("expires_in");
      const token_type = hashParams.get("token_type");
      
      console.log('🔑 Token extraction results:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        accessTokenPreview: access_token ? access_token.substring(0, 15) + '...' : 'None',
        refreshTokenPreview: refresh_token ? refresh_token.substring(0, 15) + '...' : 'None',
        expiresIn: expires_in,
        tokenType: token_type
      });
      
      if (access_token && refresh_token) {
        console.log('✅ Valid OAuth tokens found, creating Supabase session...');
        showLoadingState('Processing GitHub login...');
        
        try {
          console.log('🔑 OAUTH DEBUG - About to call supabase.auth.setSession...');
          
          // Create Supabase session with OAuth tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token
          });
          
          console.log('📊 OAUTH DEBUG - Supabase setSession result:', {
            success: !error,
            hasSession: !!data?.session,
            hasUser: !!data?.session?.user,
            error: error?.message || 'None',
            fullError: error
          });
          
          if (data?.session) {
            console.log('📊 OAUTH DEBUG - Session details:', {
              userId: data.session.user?.id,
              userEmail: data.session.user?.email,
              provider: data.session.user?.app_metadata?.provider,
              sessionExpiry: data.session.expires_at
            });
          }
          
          // Handle session setup failure clearly
          if (error) {
            console.error('❌ Failed to create Supabase session:', error);
            
            // Clear any existing session to prevent conflicts
            await supabase.auth.signOut();
            clearSession();
            localStorage.removeItem("supabase-session");
            
            showError(`GitHub login failed: ${error.message}`);
            return;
          }
          
          // Ensure session was established
          if (!data?.session) {
            console.error("❌ Supabase session not established.");
            showError("Login failed. Please try again or use email login.");
            return;
          }
          
          const user = data.session.user;
          console.log('🎉 GitHub OAuth SUCCESS!');
          console.log('👤 User authenticated:', {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            provider: user.app_metadata?.provider,
            avatar: user.user_metadata?.avatar_url
          });
          
          // Store session in localStorage as backup
          localStorage.setItem("supabase-session", JSON.stringify(data.session));
          setSession(data.session.access_token);
          currentUser = user;
          
          console.log('💾 Session stored successfully');
          
          // Clean up URL and redirect to dashboard immediately after successful session creation
          if (data.session && window.location.hash.includes('access_token')) {
            console.log("✅ Session established, cleaning up URL...");
            history.replaceState(null, '', '/admin/#/dashboard');
          }
          
          // Show success message briefly and immediately render dashboard
          showLoadingState(`Welcome, ${user.email}! Loading dashboard...`);
          
          // Immediately call the function to render dashboard content
          console.log('🎯 Immediately routing to dashboard...');
          setTimeout(() => {
            route();
          }, 100);
          
          return;
          
        } catch (sessionError) {
          console.error('❌ OAuth session processing failed:', sessionError);
          
          // Clear any existing session to prevent conflicts
          try {
            await supabase.auth.signOut();
            clearSession();
            localStorage.removeItem("supabase-session");
          } catch (logoutError) {
            console.warn('⚠️ Error during session cleanup:', logoutError.message);
          }
          
          app.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #e74c3c;">
              <h2>🔐 Session Setup Failed</h2>
              <p>Error processing your GitHub login: ${sessionError.message}</p>
              <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
                <button onclick="window.location.hash='#/login'; location.reload();" 
                        style="background: #e91e63; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                  Try GitHub Again
                </button>
                <button onclick="window.location.hash='#/login'; location.reload();" 
                        style="background: transparent; color: #e91e63; border: 2px solid #e91e63; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                  Log in with Email Instead
                </button>
              </div>
              <p style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
                Session processing failed. You can retry or use email login.
              </p>
            </div>
          `;
          return;
        }
      } else {
        console.error('❌ Incomplete OAuth tokens received');
        
        // Clear any existing session to prevent conflicts
        try {
          await supabase.auth.signOut();
          clearSession();
          localStorage.removeItem("supabase-session");
        } catch (logoutError) {
          console.warn('⚠️ Error during session cleanup:', logoutError.message);
        }
        
        app.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: #e74c3c;">
            <h2>🔗 Incomplete GitHub Response</h2>
            <p>The GitHub login didn't provide all required authentication data.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
              <button onclick="window.location.hash='#/login'; location.reload();" 
                      style="background: #e91e63; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                Try GitHub Again
              </button>
              <button onclick="window.location.hash='#/login'; location.reload();" 
                      style="background: transparent; color: #e91e63; border: 2px solid #e91e63; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                Log in with Email Instead
              </button>
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: #666;">
              GitHub didn't send complete authentication data. Email login might work better.
            </p>
          </div>
        `;
        return;
      }
    }
    
    // ========== STEP 2: CHECK EXISTING SESSION ==========
    console.log('🔍 SESSION DEBUG - No OAuth tokens found, checking for existing session...');
    
    try {
      console.log('🔍 SESSION DEBUG - Calling supabase.auth.getSession()...');
      const { data, error } = await supabase.auth.getSession();
      
      console.log('🔍 SESSION DEBUG - getSession result:', {
        hasData: !!data,
        hasSession: !!data?.session,
        hasUser: !!data?.session?.user,
        error: error?.message || 'None'
      });
      
      if (error) {
        console.warn('⚠️ Session check error:', error.message);
        throw error;
      }
      
      if (data?.session?.user) {
        console.log('✅ Existing valid session found');
        console.log('👤 Current user:', {
          id: data.session.user.id,
          email: data.session.user.email,
          provider: data.session.user.app_metadata?.provider
        });
        
        // Update global state
        currentUser = data.session.user;
        setSession(data.session.access_token);
        localStorage.setItem("supabase-session", JSON.stringify(data.session));
        
        // Route to appropriate page
        if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/login') {
          console.log('🎯 Redirecting authenticated user to dashboard');
          window.location.hash = '#/dashboard';
        }
        
        route();
        return;
      } else {
        console.log('ℹ️ No active session found');
      }
    } catch (sessionError) {
      console.warn('⚠️ Session check failed:', sessionError.message);
      clearSession();
      localStorage.removeItem("supabase-session");
    }
    
    // ========== STEP 3: CHECK STORED SESSION ==========
    const storedSession = localStorage.getItem("supabase-session");
    if (storedSession) {
      console.log('🔍 Found stored session, attempting to restore...');
      
      try {
        const sessionData = JSON.parse(storedSession);
        
        if (sessionData?.access_token && sessionData?.refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token
          });
          
          if (!error && data?.session?.user) {
            console.log('✅ Successfully restored session from storage');
            currentUser = data.session.user;
            setSession(data.session.access_token);
            
            if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/login') {
              window.location.hash = '#/dashboard';
            }
            
            route();
            return;
          } else {
            console.log('⚠️ Stored session is invalid, clearing...');
            localStorage.removeItem("supabase-session");
            clearSession();
          }
        }
      } catch (parseError) {
        console.warn('⚠️ Failed to parse stored session:', parseError.message);
        localStorage.removeItem("supabase-session");
        clearSession();
      }
    }
    
    // ========== STEP 4: NO AUTHENTICATION - SHOW LOGIN ==========
    console.log('🔓 LOGIN DEBUG - No authentication found, showing login page');
    console.log('🔓 LOGIN DEBUG - Current hash before redirect:', window.location.hash);
    
    if (!window.location.hash || window.location.hash === '#/') {
      console.log('🔓 LOGIN DEBUG - Setting hash to #/login');
      window.location.hash = '#/login';
    }
    
    console.log('🔓 LOGIN DEBUG - About to call route()');
    route();
    
  } catch (criticalError) {
    console.error('💥 Critical initialization error:', criticalError);
    app.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #e74c3c;">
        <h2>💥 Initialization Failed</h2>
        <p>Failed to start the admin dashboard: ${criticalError.message}</p>
        <button onclick="window.location.reload()" 
                style="background: #e91e63; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 1rem; margin-top: 1rem;">
          Reload Application
        </button>
      </div>
    `;
  }
});

// Additional load event handler for redundancy
window.addEventListener('load', () => {
  console.log('Window load event triggered');
  
  // Safety check - if app is still empty after 3 seconds, show error
  setTimeout(() => {
    const app = document.getElementById('app');
    if (app && (!app.innerHTML.trim() || app.innerHTML.includes('Loading'))) {
      console.warn('App appears to be stuck loading, forcing route...');
      if (!window.location.hash || window.location.hash === '#/') {
        window.location.hash = '#/login';
      }
      route();
    }
  }, 3000);
}); 