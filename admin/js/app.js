// CT5 Pride Admin SPA - app.js
// Handles hash-based routing, authentication, and view switching

console.log('🚀 CT5 PRIDE ADMIN - app.js starting initialization v1.1');
console.log('🚀 SCRIPT LOAD DEBUG - app.js has loaded successfully');
console.log('🚀 SCRIPT LOAD DEBUG - Current URL:', window.location.href);

// Add error handler for unhandled errors
window.addEventListener('error', (e) => {
  // Ignore focus-related errors as they're not critical
  if (e.error?.message?.includes('focus') || e.error?.message?.includes('Cannot read properties of null')) {
    console.warn('Non-critical error (focus):', e.error?.message);
    return;
  }
  
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
  { id: 'risk-register', label: 'Risk Register', icon: '⚠️', url: '/admin/risk_register.html' },
  { id: 'roles', label: 'Role Management', icon: '👥' },
  { id: 'applications', label: 'Applications', icon: '📝' },
  { id: 'events', label: 'Event Management', icon: '📅' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'memberships-list', label: 'Memberships', icon: '🪪' }
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
    case '#/applications':
      console.log('✓ Rendering applications page for authenticated user');
      renderApplications();
      break;
    case '#/events':
      console.log('✓ Rendering events page for authenticated user');
      renderEvents();
      break;
    case '#/analytics':
      console.log('✓ Rendering analytics page for authenticated user');
      renderAnalytics();
      break;
    case '#/memberships-list':
      console.log('✓ Rendering memberships page for authenticated user');
      renderMemberships();
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
    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.focus();
    }
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
    const redirectUrl = `${window.location.origin}/`;
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
              href="${item.url || '#/' + item.id}" 
              class="nav-link ${currentView === item.id ? 'active' : ''}"
              aria-current="${currentView === item.id ? 'page' : 'false'}"
              data-external="${item.url ? 'true' : 'false'}"
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
              ${role.time_commitment ? `<p><strong>Time Commitment:</strong> ${role.time_commitment}</p>` : ''}
            </div>
            <div class="role-summary">
              ${role.summary || role.description || 'No description available'}
            </div>
            ${role.essential_criteria || role.desirable_criteria ? `
            <div class="role-criteria-preview">
              ${role.essential_criteria ? `
                <div class="criteria-section">
                  <strong>🟢 Essential Criteria:</strong>
                  <div class="criteria-preview">${role.essential_criteria.substring(0, 100)}${role.essential_criteria.length > 100 ? '...' : ''}</div>
                </div>
              ` : ''}
              ${role.desirable_criteria ? `
                <div class="criteria-section">
                  <strong>🔵 Desirable Criteria:</strong>
                  <div class="criteria-preview">${role.desirable_criteria.substring(0, 100)}${role.desirable_criteria.length > 100 ? '...' : ''}</div>
                </div>
              ` : ''}
            </div>
            ` : ''}
            <div class="role-actions">
              <button class="btn btn-sm btn-secondary" onclick="editRole('${role.id}')">Edit</button>
              <button class="btn btn-sm btn-danger" onclick="deleteRole('${role.id}')">Delete</button>
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
  
  // Modal implementation with extended fields
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog" style="max-width: 600px;">
      <div class="modal-header">
        <h2>${isEdit ? 'Edit Role' : 'Add New Role'}</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <form class="modal-form" onsubmit="handleRoleSubmit(event, ${roleId ? `'${roleId}'` : 'null'})">
        <div class="form-group">
          <label>Title *</label>
          <input type="text" name="title" value="${role.title || ''}" required>
        </div>
        <div class="form-group">
          <label>Department</label>
          <input type="text" name="department" value="${role.department || ''}" placeholder="e.g. Events, Marketing, Community">
        </div>
        <div class="form-group">
          <label>Summary</label>
          <textarea name="summary" rows="3" placeholder="Brief description that appears on role cards">${role.summary || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea name="description" rows="4" placeholder="Detailed role description">${role.description || ''}</textarea>
        </div>
        <div class="form-group">
          <label>Essential Criteria</label>
          <textarea name="essential_criteria" rows="4" placeholder="e.g. Experience managing teams&#10;Strong communication skills&#10;Available for weekend events">${role.essential_criteria || ''}</textarea>
          <small class="form-help">Enter each criterion on a new line</small>
        </div>
        <div class="form-group">
          <label>Desirable Criteria</label>
          <textarea name="desirable_criteria" rows="4" placeholder="e.g. Knowledge of LGBTQIA+ issues&#10;Previous volunteer experience&#10;Marketing or social media skills">${role.desirable_criteria || ''}</textarea>
          <small class="form-help">Enter each criterion on a new line</small>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Location</label>
            <input type="text" name="location" value="${role.location || ''}" placeholder="e.g. Canterbury, Remote, Hybrid">
          </div>
          <div class="form-group">
            <label>Time Commitment</label>
            <input type="text" name="time_commitment" value="${role.time_commitment || ''}" placeholder="e.g. 2-3 hours/week, Flexible">
          </div>
        </div>
        <div class="form-group">
          <label>Reporting Line</label>
          <input type="text" name="reporting_line" value="${role.reporting_line || ''}" placeholder="e.g. Events Coordinator, Board of Directors">
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

// ==================== APPLICATIONS VIEW ====================

async function renderApplications() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('applications')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Application Management</h1>
          <p>Review and manage all volunteer applications</p>
        </div>
        <div id="applications-content" class="applications-container">
          <!-- Content will be loaded here -->
        </div>
      </main>
    </div>
  `;
  
  await loadApplications();
}

async function loadApplications() {
  const content = document.getElementById('applications-content');
  showLoading(content, 'Loading applications...');
  
  try {
    const response = await apiRequest('/api/applications');
    applications = response.applications;
    
    if (applications.length === 0) {
      content.innerHTML = `
        <div class="no-data">
          <h3>No applications found</h3>
          <p>There are no applications yet. Applications will appear here once submitted.</p>
        </div>
      `;
      return;
    }
    
    // Group applications by status
    const pendingApps = applications.filter(app => !app.status || app.status === 'pending');
    const acceptedApps = applications.filter(app => app.status === 'accepted');
    const rejectedApps = applications.filter(app => app.status === 'rejected');
    
    // Function to render application card with appropriate actions
    const renderApplicationCard = (app, showAllActions = true) => `
      <div class="application-card status-${app.status || 'pending'}">
        <div class="application-header">
          <h3>${app.full_name}</h3>
          <span class="application-role">${app.roles?.title || 'Unknown Role'}</span>
        </div>
        <div class="application-details">
          <p><strong>Email:</strong> ${app.email}</p>
          <p><strong>Phone:</strong> ${app.phone || 'N/A'}</p>
          <p><strong>Date Submitted:</strong> ${formatDate(app.submitted_at)}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${app.status || 'pending'}">${app.status || 'Pending'}</span></p>
        </div>
        <div class="application-actions">
          <button class="btn btn-sm btn-primary" data-action="view-details" data-app-id="${app.id}">View Details</button>
          ${showAllActions && (!app.status || app.status === 'pending') ? `
            <button class="btn btn-sm btn-danger" data-action="reject" data-app-id="${app.id}">Reject</button>
            <button class="btn btn-sm btn-success" data-action="accept" data-app-id="${app.id}">Accept</button>
          ` : ''}
          ${app.status === 'accepted' ? `
            <button class="btn btn-sm btn-danger" data-action="reject" data-app-id="${app.id}">Move to Rejected</button>
          ` : ''}
          ${app.status === 'rejected' ? `
            <button class="btn btn-sm btn-success" data-action="accept" data-app-id="${app.id}">Move to Accepted</button>
          ` : ''}
        </div>
      </div>
    `;
    
    content.innerHTML = `
      <div class="applications-sections">
        <!-- Pending Applications Section -->
        <div class="application-section pending-section">
          <div class="section-header">
            <h2>📋 Pending Applications</h2>
            <span class="section-count">${pendingApps.length} applications</span>
          </div>
          ${pendingApps.length > 0 ? `
            <div class="applications-grid">
              ${pendingApps.map(app => renderApplicationCard(app, true)).join('')}
            </div>
          ` : `
            <div class="no-data-section">
              <p>No pending applications</p>
            </div>
          `}
        </div>
        
        <!-- Accepted Applications Section -->
        <div class="application-section accepted-section">
          <div class="section-header">
            <h2>✅ Accepted Applications</h2>
            <span class="section-count">${acceptedApps.length} applications</span>
          </div>
          ${acceptedApps.length > 0 ? `
            <div class="applications-grid">
              ${acceptedApps.map(app => renderApplicationCard(app, false)).join('')}
            </div>
          ` : `
            <div class="no-data-section">
              <p>No accepted applications yet</p>
            </div>
          `}
        </div>
        
        <!-- Rejected Applications Section -->
        <div class="application-section rejected-section">
          <div class="section-header">
            <h2>❌ Rejected Applications</h2>
            <span class="section-count">${rejectedApps.length} applications</span>
          </div>
          ${rejectedApps.length > 0 ? `
            <div class="applications-grid">
              ${rejectedApps.map(app => renderApplicationCard(app, false)).join('')}
            </div>
          ` : `
            <div class="no-data-section">
              <p>No rejected applications yet</p>
            </div>
          `}
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Applications load error:', err);
    showError(content, err.message);
  }
}

async function viewApplicationDetails(applicationId) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('applications')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Application Details</h1>
          <p>View and manage details for a specific application.</p>
          <button class="btn btn-secondary" onclick="window.history.back()">Back to Applications</button>
        </div>
        <div id="application-details-content" class="application-details-container">
          <!-- Content will be loaded here -->
        </div>
      </main>
    </div>
  `;
  
  await loadApplicationDetails(applicationId);
}

async function loadApplicationDetails(applicationId) {
  const content = document.getElementById('application-details-content');
  showLoading(content, 'Loading application details...');
  
  try {
    const response = await apiRequest(`/api/applications/${applicationId}`);
    const application = response.application;
    
    if (!application) {
      content.innerHTML = `
        <div class="no-data">
          <h3>Application Not Found</h3>
          <p>The application with ID ${applicationId} was not found.</p>
          <button class="btn btn-primary" onclick="window.history.back()">Back to Applications</button>
        </div>
      `;
      return;
    }
    
    content.innerHTML = `
      <div class="application-details-header">
        <h2>${application.full_name}</h2>
        <p>Application for: <strong>${application.roles?.title || 'Unknown Role'}</strong></p>
        <p>Submitted on: <strong>${formatDate(application.submitted_at)}</strong></p>
        <p>Status: <span class="status-${application.status || 'pending'}">${application.status || 'Pending'}</span></p>
      </div>
      <div class="application-details-body">
        <h3>Personal Information</h3>
        <p><strong>Full Name:</strong> ${application.full_name}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
        
        <h3>Role Applied For</h3>
        <p><strong>Role:</strong> ${application.roles?.title || 'Unknown Role'}</p>
        <p><strong>Department:</strong> ${application.roles?.department || 'N/A'}</p>
        
        ${application.cover_letter ? `
        <h3>Cover Letter (Text)</h3>
        <div class="cover-letter-section">
          <div class="cover-letter-content">
            ${application.cover_letter.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}
        
        ${application.cover_letter_url ? `
        <h3>Cover Letter (File)</h3>
        <p><strong>File:</strong> <button class="btn btn-sm btn-secondary" data-action="open-file" data-app-id="${application.id}" data-file-type="cover_letter">📄 View Cover Letter</button></p>
        ` : ''}
        
        ${!application.cover_letter && !application.cover_letter_url ? `
        <h3>Cover Letter</h3>
        <p class="no-cover-letter">No cover letter submitted</p>
        ` : ''}
        
        ${application.cv_text ? `
        <h3>CV (Text)</h3>
        <div class="cv-section">
          <div class="cv-content">
            ${application.cv_text.replace(/\n/g, '<br>')}
          </div>
        </div>
        ` : ''}
        
        ${application.cv_url ? `
        <h3>CV (File)</h3>
        <p><strong>CV File:</strong> <button class="btn btn-sm btn-secondary" data-action="open-file" data-app-id="${application.id}" data-file-type="cv">📄 Download CV</button></p>
        ` : ''}
        
        ${!application.cv_text && !application.cv_url ? `
        <h3>CV</h3>
        <p class="no-cv">No CV submitted</p>
        ` : ''}
        
        <h3>Privacy Consent</h3>
        <p><strong>Privacy Policy Agreed:</strong> ${application.privacy_consent ? '✅ Agreed' : '❌ Not Agreed'}</p>
        
        <div class="application-actions">
          <button class="btn btn-primary" data-action="accept" data-app-id="${application.id}">Accept Application</button>
          <button class="btn btn-danger" data-action="reject" data-app-id="${application.id}">Reject Application</button>
          <button class="btn btn-secondary" onclick="window.history.back()">Back to Applications</button>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Application details load error:', err);
    showError(content, err.message);
  }
}

async function acceptApplication(applicationId) {
  if (!confirm('Are you sure you want to accept this application?')) return;
  
  try {
    await apiRequest(`/api/applications/${applicationId}/accept`, { method: 'POST' });
    showSuccess('Application accepted successfully!');
    
    // Check which view we're currently on and refresh appropriately
    const detailsContent = document.getElementById('application-details-content');
    const applicationsContent = document.getElementById('applications-content');
    
    if (detailsContent) {
      // We're on the details page, refresh the details view
      await loadApplicationDetails(applicationId);
    } else if (applicationsContent) {
      // We're on the applications list page, refresh the list
      await loadApplications();
    }
  } catch (err) {
    console.error('Accept application error:', err);
    
    // Show error in the appropriate place
    const detailsContent = document.getElementById('application-details-content');
    const applicationsContent = document.getElementById('applications-content');
    
    if (detailsContent) {
      showError(detailsContent, err.message);
    } else if (applicationsContent) {
      showError(applicationsContent, err.message);
    } else {
      // Fallback to alert if no appropriate container found
      alert('Error: ' + err.message);
    }
  }
}

async function rejectApplication(applicationId) {
  if (!confirm('Are you sure you want to reject this application?')) return;
  
  try {
    await apiRequest(`/api/applications/${applicationId}/reject`, { method: 'POST' });
    showSuccess('Application rejected successfully!');
    
    // Check which view we're currently on and refresh appropriately
    const detailsContent = document.getElementById('application-details-content');
    const applicationsContent = document.getElementById('applications-content');
    
    if (detailsContent) {
      // We're on the details page, refresh the details view
      await loadApplicationDetails(applicationId);
    } else if (applicationsContent) {
      // We're on the applications list page, refresh the list
      await loadApplications();
    }
  } catch (err) {
    console.error('Reject application error:', err);
    
    // Show error in the appropriate place
    const detailsContent = document.getElementById('application-details-content');
    const applicationsContent = document.getElementById('applications-content');
    
    if (detailsContent) {
      showError(detailsContent, err.message);
    } else if (applicationsContent) {
      showError(applicationsContent, err.message);
    } else {
      // Fallback to alert if no appropriate container found
      alert('Error: ' + err.message);
    }
  }
}

// Global functions for application management - ensure they're available immediately
window.viewApplicationDetails = viewApplicationDetails;
window.acceptApplication = acceptApplication;
window.rejectApplication = rejectApplication;

// Debug: Log that functions are available
console.log('✅ Application management functions registered:', {
  viewApplicationDetails: typeof window.viewApplicationDetails,
  acceptApplication: typeof window.acceptApplication,
  rejectApplication: typeof window.rejectApplication
});

// Add event delegation for application management buttons
document.addEventListener('click', function(e) {
  const target = e.target;
  
  // Handle View Details buttons
  if (target.matches('[data-action="view-details"]')) {
    e.preventDefault();
    const applicationId = target.getAttribute('data-app-id');
    console.log('🔍 View Details clicked for application:', applicationId);
    try {
      viewApplicationDetails(applicationId);
    } catch (error) {
      console.error('viewApplicationDetails error:', error);
      alert('Error viewing application details: ' + error.message);
    }
  }
  
  // Handle Accept buttons
  if (target.matches('[data-action="accept"]')) {
    e.preventDefault();
    const applicationId = target.getAttribute('data-app-id');
    console.log('✅ Accept clicked for application:', applicationId);
    try {
      acceptApplication(applicationId);
    } catch (error) {
      console.error('acceptApplication error:', error);
      alert('Error accepting application: ' + error.message);
    }
  }
  
  // Handle Reject buttons
  if (target.matches('[data-action="reject"]')) {
    e.preventDefault();
    const applicationId = target.getAttribute('data-app-id');
    console.log('❌ Reject clicked for application:', applicationId);
    try {
      rejectApplication(applicationId);
    } catch (error) {
      console.error('rejectApplication error:', error);
      alert('Error rejecting application: ' + error.message);
    }
  }
  
  // Handle Open Secure File buttons
  if (target.matches('[data-action="open-file"]')) {
    e.preventDefault();
    const applicationId = target.getAttribute('data-app-id');
    const fileType = target.getAttribute('data-file-type');
    console.log('📄 Open file clicked for application:', applicationId, 'type:', fileType);
    try {
      openSecureFile(applicationId, fileType);
    } catch (error) {
      console.error('openSecureFile error:', error);
      alert('Error opening file: ' + error.message);
    }
  }
});

// ==================== EVENTS VIEW ====================

async function renderEvents() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('events')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Event Management</h1>
          <p>Live events from your Eventbrite organization with backup redundancy</p>
          <div class="page-header-actions">
            <button class="btn btn-secondary" onclick="backupSyncEvents()">Backup to Database</button>
            <button class="btn btn-primary" onclick="loadEvents()">Refresh Events</button>
          </div>
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
  
  // Show minimal loading for better perceived performance
  content.innerHTML = '<div class="loading-minimal">⚡ Loading events...</div>';
  
  try {
    const startTime = Date.now();
    const response = await apiRequest('/api/events');
    const loadTime = Date.now() - startTime;
    
    events = response.events || [];
    
    // Show data source indicator with performance info
    const cacheStatus = response.cached ? ' (cached)' : '';
    const sourceIndicator = response.source === 'backup' ? 
      `<div class="alert alert-warning">⚠️ Using backup data - Eventbrite API unavailable${cacheStatus}</div>` :
      `<div class="alert alert-success">📡 Live data from Eventbrite${cacheStatus} <small>(${loadTime}ms)</small></div>`;
    
    if (events.length === 0) {
      content.innerHTML = `
        ${sourceIndicator}
        <div class="no-data">
          <h3>No events found</h3>
          <p>No events are currently published on your Eventbrite organization.</p>
          <a href="https://www.eventbrite.co.uk/create" target="_blank" class="btn btn-primary">Create Event on Eventbrite</a>
        </div>
      `;
      return;
    }
    
    // Use DocumentFragment for better DOM performance
    const fragment = document.createDocumentFragment();
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = `
      ${sourceIndicator}
      <div class="events-grid">
        ${events.map(event => renderEventCard(event, response.source)).join('')}
      </div>
    `;
    
    // Move all elements to fragment at once
    while (tempContainer.firstChild) {
      fragment.appendChild(tempContainer.firstChild);
    }
    
    // Single DOM update
    content.innerHTML = '';
    content.appendChild(fragment);
    
    console.log(`✅ Rendered ${events.length} events in ${Date.now() - startTime}ms`);
    
  } catch (err) {
    console.error('Events load error:', err);
    content.innerHTML = `
      <div class="alert alert-danger">
        ❌ Failed to load events: ${err.message}
        <button class="btn btn-sm btn-secondary" onclick="loadEvents()" style="margin-left: 10px;">Retry</button>
      </div>
    `;
  }
}

// Optimized event card rendering function
function renderEventCard(event, source) {
  const eventName = event.name?.text || event.title || event.name || 'Untitled Event';
  const eventDate = event.start?.utc || event.start_time || event.start_date;
  const eventLocation = event.venue?.name || event.venue_name || 'Location TBD';
  const eventStatus = event.status || 'Unknown';
  const eventDescription = event.description?.text || event.description || 'No description available';
  const eventId = event.id || event.eventbrite_id;
  
  return `
    <div class="event-card eventbrite-event">
      <div class="event-header">
        <h3>${escapeHtml(eventName)}</h3>
        <span class="event-source source-eventbrite">${source === 'backup' ? 'From Backup' : 'Live from Eventbrite'}</span>
      </div>
      <div class="event-details">
        <p><strong>Date:</strong> ${formatDate(eventDate)}</p>
        <p><strong>Location:</strong> ${escapeHtml(eventLocation)}</p>
        <p><strong>Status:</strong> <span class="status-badge status-${eventStatus.toLowerCase()}">${escapeHtml(eventStatus)}</span></p>
        <p><strong>Event ID:</strong> ${eventId}</p>
        ${event.venue?.address || event.venue_address ? `<p><strong>Address:</strong> ${escapeHtml(event.venue?.address?.localized_address_display || event.venue_address || '')}</p>` : ''}
        ${event.capacity || event.tickets_sold !== undefined ? `
          <div class="ticket-info">
            <p><strong>Capacity:</strong> ${event.capacity || 'Unknown'}</p>
            <p><strong>Tickets Sold:</strong> ${event.tickets_sold || 0}</p>
            <p><strong>Remaining:</strong> ${event.tickets_remaining || 0}</p>
            ${event.sold_out ? '<p class="sold-out-indicator">❌ <strong>SOLD OUT</strong></p>' : ''}
            ${event.capacity && event.tickets_sold ? `
              <div class="admin-sales-bar">
                <div class="admin-sales-progress" style="width: ${Math.round((event.tickets_sold / event.capacity) * 100)}%"></div>
              </div>
              <p class="sales-percentage"><strong>${Math.round((event.tickets_sold / event.capacity) * 100)}% Sold</strong></p>
            ` : ''}
          </div>
        ` : ''}
      </div>
      <div class="event-summary">
        ${escapeHtml(eventDescription.substring(0, 150))}${eventDescription.length > 150 ? '...' : ''}
      </div>
      <div class="event-actions">
        <a href="${event.url}" target="_blank" class="btn btn-sm btn-secondary">View on Eventbrite</a>
        <a href="${event.url}" target="_blank" class="btn btn-sm btn-primary">Get Tickets</a>
      </div>
    </div>
  `;
}

async function backupSyncEvents() {
  const button = event?.target;
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="loading-spinner"></span> Backing up...';
  }
  
  try {
    const response = await apiRequest('/api/events/backup-sync', {
      method: 'POST'
    });
    
    showSuccess(response.message || 'Events backed up successfully!');
    await loadEvents(); // Refresh to show any changes
  } catch (err) {
    console.error('Backup sync error:', err);
    showError(document.getElementById('events-content'), err.message);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = 'Backup to Database';
    }
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
      body: JSON.stringify({ eventbriteUrl: eventInput })
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

async function autoSyncEvents() {
  const button = event?.target;
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="loading-spinner"></span> Syncing...';
  }
  
  try {
    const response = await apiRequest('/api/events/auto-sync', {
      method: 'POST'
    });
    
    showSuccess(response.message || 'Events synced successfully!');
    await loadEvents();
  } catch (err) {
    console.error('Auto-sync error:', err);
    showError(document.getElementById('events-content'), err.message);
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = 'Auto-Sync All Events';
    }
  }
}

// Utility function for HTML escaping
function escapeHtml(text) {
  if (!text) return '';
  // Convert to string to handle non-string values
  if (typeof text !== 'string') {
    text = String(text);
  }
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Global functions for event management
window.openSyncEventModal = openSyncEventModal;
window.handleSyncEvent = handleSyncEvent;
window.deleteEvent = deleteEvent;
window.autoSyncEvents = autoSyncEvents;
window.backupSyncEvents = backupSyncEvents;

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

// ==================== MEMBERSHIPS VIEW ====================

async function renderMemberships() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('memberships-list')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Memberships</h1>
          <p>View and manage all membership applications</p>
        </div>
        <div id="memberships-content" class="memberships-container"></div>
      </main>
    </div>
  `;
  await loadMemberships();
}

async function loadMemberships() {
  const content = document.getElementById('memberships-content');
  showLoading(content, 'Loading memberships...');
  try {
    const response = await apiRequest('/api/memberships');
    const memberships = response.memberships;
    if (!memberships || memberships.length === 0) {
      content.innerHTML = `<div class="no-data"><h3>No memberships found</h3></div>`;
      return;
    }
    content.innerHTML = `
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Pronouns</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Date of Birth</th>
              <th>Address + Postcode</th>
              <th>Membership Type</th>
              <th>Membership Number</th>
              <th>Plan Name</th>
              <th>Renewal Date</th>
              <th>Agreement</th>
              <th>Date Submitted</th>
            </tr>
          </thead>
          <tbody>
            ${memberships.map(m => `
              <tr data-member-id="${m.id}">
                <td>${m.full_name || ''}</td>
                <td>${m.pronouns || ''}</td>
                <td>${m.email || ''}</td>
                <td>${m.phone || ''}</td>
                <td>${m.date_of_birth ? formatDate(m.date_of_birth) : ''}</td>
                <td>${m.address || ''} ${m.postcode || ''}</td>
                <td>${m.membership_type || ''}</td>
                <td>${m.membership_number || ''}</td>
                <td class="plan-name" data-loading="true">Loading...</td>
                <td class="renewal-date" data-loading="true">Loading...</td>
                <td>
                  <span title="Confirmed Info">${m.confirm_info ? '✅' : '❌'}</span>
                  <span title="Conduct Policy">${m.agree_conduct_policy ? '✅' : '❌'}</span>
                  <span title="Privacy">${m.agree_privacy ? '✅' : '❌'}</span>
                </td>
                <td>${m.created_at ? formatDate(m.created_at) : ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    // Load Stripe data for each membership
    await loadStripeDataForMemberships(memberships);
    
  } catch (err) {
    console.error('Memberships load error:', err);
    showError(content, err.message);
  }
}

// ==================== STRIPE DATA LOADING ====================

async function loadStripeDataForMemberships(memberships) {
  // Process memberships in parallel for better performance
  const stripePromises = memberships.map(async (member) => {
    try {
      // Only fetch Stripe data if member has a Stripe customer ID
      if (!member.stripe_customer_id) {
        updateMembershipStripeUI(member.id, null, 'No Stripe ID');
        return;
      }
      
      // Fetch Stripe subscription data
      const response = await fetch(`/api/membership/${member.id}/stripe`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getSession()?.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const stripeData = await response.json();
        if (stripeData.success) {
          updateMembershipStripeUI(member.id, stripeData, null);
        } else {
          updateMembershipStripeUI(member.id, null, stripeData.error || 'Stripe error');
        }
      } else {
        updateMembershipStripeUI(member.id, null, 'API error');
      }
      
    } catch (err) {
      console.error(`Stripe data fetch error for member ${member.id}:`, err);
      updateMembershipStripeUI(member.id, null, 'Fetch failed');
    }
  });
  
  // Wait for all Stripe requests to complete
  await Promise.allSettled(stripePromises);
}

function updateMembershipStripeUI(memberId, stripeData, errorMessage) {
  const memberRow = document.querySelector(`tr[data-member-id="${memberId}"]`);
  if (!memberRow) return;
  
  const planNameCell = memberRow.querySelector('.plan-name');
  const renewalDateCell = memberRow.querySelector('.renewal-date');
  
  if (stripeData && stripeData.success) {
    // Successfully got Stripe data
    planNameCell.textContent = stripeData.plan || 'Unknown Plan';
    planNameCell.removeAttribute('data-loading');
    
    if (stripeData.renewal_date) {
      renewalDateCell.textContent = formatDate(stripeData.renewal_date);
    } else {
      renewalDateCell.textContent = '–';
    }
    renewalDateCell.removeAttribute('data-loading');
    
  } else {
    // Error or no data available
    planNameCell.textContent = '–';
    planNameCell.removeAttribute('data-loading');
    
    renewalDateCell.textContent = '–';
    renewalDateCell.removeAttribute('data-loading');
  }
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

// Handle navigation clicks for external links
document.addEventListener('click', function(e) {
  const target = e.target.closest('.nav-link');
  if (target && target.getAttribute('data-external') === 'true') {
    e.preventDefault();
    console.log('🔗 External navigation detected:', target.href);
    window.location.href = target.href;
  }
});

// Session management helper functions
function isAuthenticated() {
  const hasUser = !!currentUser;
  const hasToken = !!getSession();
  const result = hasUser && hasToken;
  
  console.log('🔍 isAuthenticated() check:', {
    hasUser,
    hasToken,
    userEmail: currentUser?.email || 'None',
    tokenPreview: hasToken ? getSession().substring(0, 15) + '...' : 'None',
    result
  });
  
  return result;
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
          console.log('🔍 POST-OAUTH DEBUG - Authentication state after setting:', {
            currentUserSet: !!currentUser,
            tokenStored: !!getSession(),
            userEmail: currentUser?.email,
            isAuthenticatedNow: isAuthenticated()
          });
          
          // Clean up URL and redirect to dashboard immediately after successful session creation
          if (data.session) {
            console.log("✅ Session established, cleaning up URL...");
            console.log("🔍 URL DEBUG - Before cleanup:", window.location.href);
            history.replaceState(null, '', '/#/dashboard');
            console.log("🔍 URL DEBUG - After cleanup:", window.location.href);
          }
          
          // Show success message briefly and immediately render dashboard
          showLoadingState(`Welcome, ${user.email}! Loading dashboard...`);
          
          // Immediately call the function to render dashboard content
          console.log('🎯 Immediately routing to dashboard...');
          
          // Ensure URL is set correctly
          if (window.location.hash !== '#/dashboard') {
            console.log('🔧 URL DEBUG - Setting hash to #/dashboard');
            window.location.hash = '#/dashboard';
          }
          
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

// ==================== SECURE FILE ACCESS ====================

// Function to open secure file with signed URL
async function openSecureFile(applicationId, fileType) {
  try {
    console.log(`🔒 Fetching secure access for ${fileType} from application ${applicationId}`);
    
    // Show loading state on button
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'Loading...';
    button.disabled = true;
    
    try {
      // Fetch signed URLs from backend
      const response = await apiRequest(`/api/application/${applicationId}/files`);
      
      if (response.success) {
        let signedUrl = null;
        
        if (fileType === 'cv' && response.signed_cv_url) {
          signedUrl = response.signed_cv_url;
        } else if (fileType === 'cover_letter' && response.signed_cover_letter_url) {
          signedUrl = response.signed_cover_letter_url;
        }
        
        if (signedUrl) {
          console.log(`✅ Opening ${fileType} file with signed URL (expires in 10 minutes)`);
          // Open file in new tab
          window.open(signedUrl, '_blank', 'noopener,noreferrer');
        } else {
          console.warn(`❌ No ${fileType} file available`);
          showError(button.parentElement, `No ${fileType === 'cv' ? 'CV' : 'cover letter'} file found`);
        }
      } else {
        console.error('Failed to get signed URLs:', response.message);
        showError(button.parentElement, 'Failed to access file: ' + response.message);
      }
      
    } catch (fetchError) {
      console.error('Secure file access error:', fetchError);
      showError(button.parentElement, 'Failed to access file. Please try again.');
    } finally {
      // Reset button state
      button.textContent = originalText;
      button.disabled = false;
    }
    
  } catch (err) {
    console.error('Secure file access error:', err);
    // Reset button if there was an error
    if (event && event.target) {
      event.target.disabled = false;
      event.target.textContent = event.target.textContent.replace('Loading...', '📄 Download');
    }
  }
}

// Make openSecureFile globally available
window.openSecureFile = openSecureFile;