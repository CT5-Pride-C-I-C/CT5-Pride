// CT5 Pride Admin SPA - app.js
// Handles hash-based routing, authentication, and view switching

console.log('Session loaded - app.js starting initialization');

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
const supabase = window.supabase.createClient(
  "https://rmhnrpwbgxyslfwttwzr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaG5ycHdiZ3h5c2xmd3R0d3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQyMDcsImV4cCI6MjA2ODY5MDIwN30.yNlkzFMfvUCoN6IwEY4LgL6_ihdR_ux22oqvDnkWTxg"
);
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
  
  console.log('Route called with hash:', hash);
  
  // Set initial loading state
  app.innerHTML = '<div style="padding: 2rem; text-align: center;"><h2>Loading...</h2></div>';
  
  // Set focus for accessibility
  app.focus();
  
  if (hash === '#/login') {
    console.log('Rendering login page');
    renderLogin();
    return;
  }
  
  // Check authentication for protected routes
  console.log('Authentication state:', {
    hasUser: !!currentUser,
    hasToken: !!getSession(),
    isAuthenticated: isAuthenticated()
  });
  
  if (!requireAuth()) {
    return; // requireAuth handles the redirect
  }
  
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
  console.log('Rendering login page...');
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
        </div>
      </div>
    </div>
  `;
  
  // Add form submission handler
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  // Add GitHub OAuth handler
  document.getElementById('github-login-btn').addEventListener('click', handleGitHubLogin);
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
  try {
    console.log('Initiating GitHub OAuth login...');
    
    // Show loading state
    const githubBtn = document.querySelector('.btn-github');
    if (githubBtn) {
      githubBtn.innerHTML = '🔄 Connecting to GitHub...';
      githubBtn.disabled = true;
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/admin/`
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

// Production-ready OAuth redirect handler - runs immediately on load
window.addEventListener("DOMContentLoaded", async () => {
  console.log('DOMContentLoaded - App initializing...');
  
  const app = document.getElementById('app');
  if (!app) {
    console.error('App container not found!');
    return;
  }
  
  // Show loading indicator
  app.innerHTML = '<div style="padding: 2rem; text-align: center; color: #666;">🔄 Loading admin dashboard...</div>';
  
  try {
    // STEP 1: DEBUG AND PROCESS OAUTH TOKENS
    const hash = window.location.hash;
    const fullURL = window.location.href;
    console.log('=== OAUTH DEBUG START ===');
    console.log('Full URL:', fullURL);
    console.log('Hash string:', hash);
    console.log('Hash length:', hash.length);
    
    if (hash && hash.includes("access_token")) {
      console.log('✓ OAuth redirect detected! Processing tokens...');
      
      // Parse the hash parameters - GitHub returns them as URL fragments
      const params = new URLSearchParams(hash.slice(1)); // Remove the #
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const expires_in = params.get("expires_in");
      const token_type = params.get("token_type");
      
      console.log('✓ Token extraction results:', {
        access_token: access_token ? `${access_token.substring(0, 10)}...` : null,
        refresh_token: refresh_token ? `${refresh_token.substring(0, 10)}...` : null,
        expires_in: expires_in,
        token_type: token_type,
        hasAllRequiredTokens: !!(access_token && refresh_token)
      });
      
      if (access_token && refresh_token) {
        console.log('✓ All required tokens found, setting Supabase session...');
        
        try {
          // Set the session using extracted tokens
          const sessionResult = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          
          console.log('✓ setSession() result:', {
            hasData: !!sessionResult.data,
            hasSession: !!sessionResult.data?.session,
            hasUser: !!sessionResult.data?.session?.user,
            error: sessionResult.error?.message || null
          });
          
          if (sessionResult.error) {
            console.error("❌ OAuth session setup failed:", sessionResult.error);
            app.innerHTML = `
              <div style="padding: 2rem; text-align: center; color: #f44336;">
                <h2>⚠️ OAuth Session Failed</h2>
                <p>Error: ${sessionResult.error.message}</p>
                <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; font-size: 0.8rem; text-align: left;">
                  ${JSON.stringify(sessionResult.error, null, 2)}
                </pre>
                <button onclick="console.log('Retrying...'); window.location.hash='#/login'; location.reload();" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                  Retry Login
                </button>
              </div>
            `;
            return;
          }
          
          if (sessionResult.data?.session) {
            const session = sessionResult.data.session;
            console.log('✓ Session created successfully!');
            console.log('✓ User info:', {
              id: session.user?.id,
              email: session.user?.email,
              provider: session.user?.app_metadata?.provider
            });
            
            // Store session data
            localStorage.setItem("sb-session", JSON.stringify(session));
            setSession(session.access_token);
            currentUser = session.user;
            
            console.log('✓ Session stored in localStorage and global state');
            
            // Verify the session was set correctly
            const verifyResult = await supabase.auth.getSession();
            console.log('✓ Session verification:', {
              hasSession: !!verifyResult.data?.session,
              sameUser: verifyResult.data?.session?.user?.id === session.user?.id
            });
            
            // Clean URL and redirect
            console.log('✓ Cleaning URL and redirecting to dashboard...');
            history.replaceState(null, null, "/admin/");
            window.location.hash = "#/dashboard";
            
            // Force route immediately and also set backup
            route();
            setTimeout(() => {
              console.log('✓ Backup route call executing...');
              route();
            }, 200);
            
            console.log('=== OAUTH DEBUG END - SUCCESS ===');
            return;
          } else {
            console.error('❌ No session returned from setSession');
            app.innerHTML = `
              <div style="padding: 2rem; text-align: center; color: #f44336;">
                <h2>⚠️ Session Creation Failed</h2>
                <p>No session was returned after token processing.</p>
                <button onclick="window.location.hash='#/login'; location.reload();" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                  Back to Login
                </button>
              </div>
            `;
            return;
          }
        } catch (oauthError) {
          console.error('❌ OAuth processing exception:', oauthError);
          app.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #f44336;">
              <h2>⚠️ OAuth Processing Error</h2>
              <p>Exception: ${oauthError.message}</p>
              <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; font-size: 0.8rem; text-align: left;">
                ${oauthError.stack || 'No stack trace available'}
              </pre>
              <button onclick="window.location.hash='#/login'; location.reload();" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                Back to Login
              </button>
            </div>
          `;
          return;
        }
      } else {
        console.error('❌ Missing required tokens:', {
          hasAccessToken: !!access_token,
          hasRefreshToken: !!refresh_token
        });
        app.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: #f44336;">
            <h2>⚠️ Invalid OAuth Response</h2>
            <p>Required tokens missing from GitHub response.</p>
            <button onclick="window.location.hash='#/login'; location.reload();" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
              Try Again
            </button>
          </div>
        `;
        return;
      }
    } else {
      console.log('✓ No OAuth tokens in URL, proceeding with normal flow...');
    }
    
    // STEP 2: Check for existing Supabase session
    console.log('Checking for existing Supabase session...');
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        throw error;
      }
      
      if (data?.session) {
        console.log('Existing session found - user already authenticated');
        
        // Store session data
        localStorage.setItem("sb-session", JSON.stringify(data.session));
        setSession(data.session.access_token);
        currentUser = data.session.user;
        
        // Redirect to dashboard if on login or root
        if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/login') {
          console.log('Redirecting authenticated user to dashboard');
          window.location.hash = '#/dashboard';
        }
        
        route();
        return;
      } else {
        console.log('No existing Supabase session found');
      }
    } catch (sessionError) {
      console.error('Session check failed:', sessionError);
      clearSession();
      localStorage.removeItem("sb-session");
    }
    
    // STEP 3: Check localStorage backup session
    const storedSession = localStorage.getItem("sb-session");
    if (storedSession) {
      console.log('Found stored session, attempting to restore...');
      try {
        const sessionData = JSON.parse(storedSession);
        if (sessionData?.access_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token
          });
          
          if (!error && data?.session) {
            console.log('Successfully restored session from localStorage');
            setSession(data.session.access_token);
            currentUser = data.session.user;
            
            if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#/login') {
              window.location.hash = '#/dashboard';
            }
            route();
            return;
          } else {
            console.log('Stored session invalid, clearing...');
            localStorage.removeItem("sb-session");
            clearSession();
          }
        }
      } catch (parseError) {
        console.error('Error parsing stored session:', parseError);
        localStorage.removeItem("sb-session");
        clearSession();
      }
    }
    
    // STEP 4: No authentication found - show login
    console.log('No authentication found, showing login page');
    if (!window.location.hash || window.location.hash === '#/') {
      window.location.hash = '#/login';
    }
    route();
    
  } catch (err) {
    console.error('Critical initialization error:', err);
    app.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #f44336;">
        <h2>❌ Initialization Failed</h2>
        <p>The admin dashboard failed to initialize: ${err.message}</p>
        <button onclick="window.location.reload()" style="background: #e91e63; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
          Reload Page
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