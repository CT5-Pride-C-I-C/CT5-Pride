// CT5 Pride Admin SPA - app.js
// Handles hash-based routing, authentication, and view switching

const SUPABASE_URL = 'https://rmhnrpwbgxyslfwttwzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaG5ycHdiZ3h5c2xmd3R0d3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQyMDcsImV4cCI6MjA2ODY5MDIwN30.yNlkzFMfvUCoN6IwEY4LgL6_ihdR_ux22oqvDnkWTxg';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// ==================== API UTILITY FUNCTIONS ====================

async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
      window.location.hash = '#/login';
      throw new Error('Session expired. Please log in again.');
    }
    throw new Error(data.message || 'Request failed');
  }
  
  return data;
}

// ==================== ROUTER ====================

function route() {
  const hash = window.location.hash || '#/login';
  const app = document.getElementById('app');
  
  // Set focus for accessibility
  app.focus();
  
  if (hash === '#/login') {
    renderLogin();
    return;
  }
  
  // Check authentication for protected routes
  const token = getSession();
  if (!token) {
    window.location.hash = '#/login';
    return;
  }
  
  switch (hash) {
    case '#/dashboard':
      renderDashboard();
      break;
    case '#/roles':
      renderRoles();
      break;
    case '#/events':
      renderEvents();
      break;
    case '#/analytics':
      renderAnalytics();
      break;
    default:
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
    <div class="error-container" role="alert">
      <div class="error-icon">⚠️</div>
      <h3>Error</h3>
      <p>${message}</p>
      <button onclick="location.reload()" class="btn btn-secondary">Retry</button>
    </div>
  `;
}

function showSuccess(message) {
  const toast = document.createElement('div');
  toast.className = 'toast toast-success';
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">✅</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('toast-show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ==================== LOGIN VIEW ====================

function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="../Images/Logo-with-Transparent-background.svg" alt="CT5 Pride Logo">
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
          
          <div id="login-error" class="error-message" role="alert"></div>
        </form>
        
        <div class="login-footer">
          <p>Secure login powered by Supabase Auth</p>
        </div>
      </div>
    </div>
  `;
  
  // Add form submission handler
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  
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
  errorDiv.textContent = '';
  
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
      errorDiv.textContent = data.message || 'Login failed';
    }
  } catch (err) {
    console.error('Login error:', err);
    errorDiv.textContent = 'Login failed. Please check your connection and try again.';
  } finally {
    // Reset button state
    btnText.style.display = 'inline';
    btnSpinner.style.display = 'none';
    submitBtn.disabled = false;
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

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error('Logout API error:', err);
  } finally {
    clearSession();
    showSuccess('Logged out successfully');
    window.location.hash = '#/login';
  }
}

// ==================== DASHBOARD VIEW ====================

async function renderDashboard() {
  const app = document.getElementById('app');
  
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

// ==================== ROLES MANAGEMENT VIEW ====================

async function renderRoles() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('roles')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Role Management</h1>
          <button class="btn btn-primary" onclick="openRoleModal()">
            <span>➕</span> Add New Role
          </button>
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
    
    content.innerHTML = `
      <div class="roles-grid">
        ${roles.map(role => `
          <div class="role-card" data-role-id="${role.id}">
            <div class="role-header">
              <h3>${role.title}</h3>
              <div class="role-status status-${role.status || 'draft'}">${role.status || 'draft'}</div>
            </div>
            <div class="role-details">
              <p><strong>Department:</strong> ${role.department || 'Not specified'}</p>
              <p><strong>Location:</strong> ${role.location || 'Not specified'}</p>
              <p><strong>Time Commitment:</strong> ${role.time_commitment || 'Not specified'}</p>
            </div>
            <div class="role-summary">
              <p>${role.summary || 'No summary available'}</p>
            </div>
            <div class="role-actions">
              <button class="btn btn-secondary btn-sm" onclick="editRole('${role.id}')">
                <span>✏️</span> Edit
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteRole('${role.id}')">
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
        `).join('') || '<p class="no-data">No roles found. Create your first role to get started.</p>'}
      </div>
    `;
  } catch (err) {
    console.error('Load roles error:', err);
    showError(content, err.message);
  }
}

function openRoleModal(roleId = null) {
  const isEdit = !!roleId;
  const role = isEdit ? roles.find(r => r.id === roleId) : {};
  
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div class="modal-header">
        <h2 id="modal-title">${isEdit ? 'Edit Role' : 'Add New Role'}</h2>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
      </div>
      <form id="roleForm" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label for="title">Role Title *</label>
            <input type="text" id="title" name="title" value="${role.title || ''}" required>
          </div>
          <div class="form-group">
            <label for="department">Department</label>
            <input type="text" id="department" name="department" value="${role.department || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label for="summary">Summary *</label>
          <textarea id="summary" name="summary" rows="3" required>${role.summary || ''}</textarea>
        </div>
        
        <div class="form-group">
          <label for="description">Full Description</label>
          <textarea id="description" name="description" rows="6">${role.description || ''}</textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="location">Location</label>
            <input type="text" id="location" name="location" value="${role.location || ''}">
          </div>
          <div class="form-group">
            <label for="time_commitment">Time Commitment</label>
            <input type="text" id="time_commitment" name="time_commitment" value="${role.time_commitment || ''}">
          </div>
        </div>
        
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status">
            <option value="draft" ${role.status === 'draft' ? 'selected' : ''}>Draft</option>
            <option value="open" ${role.status === 'open' ? 'selected' : ''}>Open for Applications</option>
            <option value="closed" ${role.status === 'closed' ? 'selected' : ''}>Closed</option>
          </select>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">
            ${isEdit ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submission handler
  document.getElementById('roleForm').addEventListener('submit', (e) => {
    handleRoleSubmit(e, roleId);
  });
  
  // Focus on first input
  setTimeout(() => {
    document.getElementById('title').focus();
  }, 100);
  
  // Add escape key handler
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
  
  // Make closeModal available globally
  window.closeModal = () => {
    modal.remove();
    delete window.closeModal;
  };
}

async function handleRoleSubmit(e, roleId = null) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = roleId ? 'Updating...' : 'Creating...';
  
  try {
    const url = roleId ? `/api/roles/${roleId}` : '/api/roles';
    const method = roleId ? 'PUT' : 'POST';
    
    await apiRequest(url, {
      method,
      body: JSON.stringify(data)
    });
    
    showSuccess(`Role ${roleId ? 'updated' : 'created'} successfully!`);
    closeModal();
    await loadRoles();
  } catch (err) {
    console.error('Role save error:', err);
    alert(`Failed to ${roleId ? 'update' : 'create'} role: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = roleId ? 'Update Role' : 'Create Role';
  }
}

function editRole(roleId) {
  openRoleModal(roleId);
}

async function deleteRole(roleId) {
  const role = roles.find(r => r.id === roleId);
  if (!role) return;
  
  if (!confirm(`Are you sure you want to delete the role "${role.title}"? This action cannot be undone.`)) {
    return;
  }
  
  try {
    await apiRequest(`/api/roles/${roleId}`, { method: 'DELETE' });
    showSuccess('Role deleted successfully!');
    await loadRoles();
  } catch (err) {
    console.error('Delete role error:', err);
    alert(`Failed to delete role: ${err.message}`);
  }
}

// ==================== EVENTS MANAGEMENT VIEW ====================

async function renderEvents() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    <div class="admin-layout">
      ${renderNavigation('events')}
      <main class="admin-content">
        <div class="page-header">
          <h1>Event Management</h1>
          <button class="btn btn-primary" onclick="openSyncEventModal()">
            <span>🔄</span> Sync Event from Eventbrite
          </button>
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
    const { eventbriteEvents, localEvents } = response;
    
    content.innerHTML = `
      <div class="events-sections">
        <div class="events-section">
          <h2>Synced Events (Local Database)</h2>
          <div class="events-grid">
            ${localEvents.map(event => `
              <div class="event-card">
                <div class="event-header">
                  <h3>${event.title}</h3>
                  <div class="event-status status-${event.status}">${event.status}</div>
                </div>
                <div class="event-details">
                  <p><strong>Start:</strong> ${formatDate(event.start_time)}</p>
                  <p><strong>End:</strong> ${formatDate(event.end_time)}</p>
                  <p><strong>Eventbrite ID:</strong> ${event.eventbrite_id}</p>
                </div>
                <div class="event-actions">
                  <a href="${event.url}" target="_blank" class="btn btn-secondary btn-sm">
                    <span>🔗</span> View on Eventbrite
                  </a>
                  <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.id}')">
                    <span>🗑️</span> Remove
                  </button>
                </div>
              </div>
            `).join('') || '<p class="no-data">No synced events. Use the sync button to import events from Eventbrite.</p>'}
          </div>
        </div>
        
        <div class="events-section">
          <h2>Recent Eventbrite Events</h2>
          <div class="events-grid">
            ${eventbriteEvents.slice(0, 6).map(event => `
              <div class="event-card eventbrite-event">
                <div class="event-header">
                  <h3>${event.name?.text || 'Untitled Event'}</h3>
                  <div class="event-status status-${event.status}">${event.status}</div>
                </div>
                <div class="event-details">
                  <p><strong>Start:</strong> ${formatDate(event.start?.utc)}</p>
                  <p><strong>End:</strong> ${formatDate(event.end?.utc)}</p>
                  <p><strong>ID:</strong> ${event.id}</p>
                </div>
                <div class="event-actions">
                  <a href="${event.url}" target="_blank" class="btn btn-secondary btn-sm">
                    <span>🔗</span> View
                  </a>
                  <button class="btn btn-primary btn-sm" onclick="syncSpecificEvent('${event.id}')">
                    <span>⬇️</span> Sync
                  </button>
                </div>
              </div>
            `).join('') || '<p class="no-data">No events found on Eventbrite.</p>'}
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Load events error:', err);
    showError(content, err.message);
  }
}

function openSyncEventModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-dialog" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div class="modal-header">
        <h2 id="modal-title">Sync Event from Eventbrite</h2>
        <button class="modal-close" onclick="closeModal()" aria-label="Close">×</button>
      </div>
      <form id="syncEventForm" class="modal-form">
        <div class="form-group">
          <label for="eventbriteUrl">Eventbrite Event URL</label>
          <input 
            type="url" 
            id="eventbriteUrl" 
            name="eventbriteUrl" 
            placeholder="https://www.eventbrite.com/e/event-name-123456789"
            required
          >
          <small>Paste the full Eventbrite event URL to sync it to the local database</small>
        </div>
        
        <div class="form-group">
          <label for="eventbriteId">Or Eventbrite Event ID</label>
          <input 
            type="text" 
            id="eventbriteId" 
            name="eventbriteId" 
            placeholder="123456789"
          >
          <small>Alternatively, enter just the event ID number</small>
        </div>
        
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Sync Event</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add form submission handler
  document.getElementById('syncEventForm').addEventListener('submit', handleSyncEvent);
  
  // Focus on first input
  setTimeout(() => {
    document.getElementById('eventbriteUrl').focus();
  }, 100);
  
  // Make closeModal available globally
  window.closeModal = () => {
    modal.remove();
    delete window.closeModal;
  };
}

async function handleSyncEvent(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const eventbriteUrl = formData.get('eventbriteUrl');
  const eventbriteId = formData.get('eventbriteId');
  
  if (!eventbriteUrl && !eventbriteId) {
    alert('Please provide either an Eventbrite URL or Event ID');
    return;
  }
  
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Syncing...';
  
  try {
    await apiRequest('/api/events/sync', {
      method: 'POST',
      body: JSON.stringify({ eventbriteUrl, eventbriteId })
    });
    
    showSuccess('Event synced successfully!');
    closeModal();
    await loadEvents();
  } catch (err) {
    console.error('Sync event error:', err);
    alert(`Failed to sync event: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sync Event';
  }
}

async function syncSpecificEvent(eventbriteId) {
  try {
    await apiRequest('/api/events/sync', {
      method: 'POST',
      body: JSON.stringify({ eventbriteId })
    });
    
    showSuccess('Event synced successfully!');
    await loadEvents();
  } catch (err) {
    console.error('Sync specific event error:', err);
    alert(`Failed to sync event: ${err.message}`);
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to remove this event from the local database? This will not affect the original Eventbrite event.')) {
    return;
  }
  
  try {
    await apiRequest(`/api/events/${eventId}`, { method: 'DELETE' });
    showSuccess('Event removed successfully!');
    await loadEvents();
  } catch (err) {
    console.error('Delete event error:', err);
    alert(`Failed to delete event: ${err.message}`);
  }
}

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
          <h2>Overview Statistics</h2>
          <div class="stats-grid">
            <div class="stat-card highlight">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <h3>Total Roles</h3>
                <div class="stat-number">${analytics.totalRoles}</div>
              </div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-icon">📝</div>
              <div class="stat-content">
                <h3>Total Applications</h3>
                <div class="stat-number">${analytics.totalApplications}</div>
              </div>
            </div>
            <div class="stat-card highlight">
              <div class="stat-icon">📅</div>
              <div class="stat-content">
                <h3>Recent Applications</h3>
                <div class="stat-number">${analytics.recentApplications}</div>
                <p class="stat-description">Last 30 days</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="analytics-section">
          <h2>Applications by Status</h2>
          <div class="chart-container">
            <canvas id="statusChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <div class="analytics-section">
          <h2>Applications by Role</h2>
          <div class="chart-container">
            <canvas id="roleChart" width="400" height="200"></canvas>
          </div>
        </div>
        
        <div class="analytics-section">
          <h2>Performance Summary</h2>
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
      </div>
    `;
    
    // Render charts
    renderStatusChart();
    renderRoleChart();
  } catch (err) {
    console.error('Load analytics error:', err);
    showError(content, err.message);
  }
}

function renderStatusChart() {
  const ctx = document.getElementById('statusChart').getContext('2d');
  const statusData = analytics.applicationsByStatus || {};
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(statusData),
      datasets: [{
        data: Object.values(statusData),
        backgroundColor: [
          '#ff6f91',
          '#ff9671',
          '#ffc75f',
          '#f9ca24',
          '#6c5ce7'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

function renderRoleChart() {
  const ctx = document.getElementById('roleChart').getContext('2d');
  const roleData = analytics.applicationsByRole || {};
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(roleData),
      datasets: [{
        label: 'Applications',
        data: Object.values(roleData),
        backgroundColor: '#ff6f91',
        borderColor: '#ff6f91',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function getMostPopularRole() {
  const roleData = analytics.applicationsByRole || {};
  const sortedRoles = Object.entries(roleData).sort(([,a], [,b]) => b - a);
  return sortedRoles.length > 0 ? `${sortedRoles[0][0]} (${sortedRoles[0][1]} applications)` : 'No data available';
}

function calculateApplicationRate() {
  const totalRoles = analytics.totalRoles || 0;
  const totalApplications = analytics.totalApplications || 0;
  return totalRoles > 0 ? `${(totalApplications / totalRoles).toFixed(1)} applications per role` : 'No data available';
}

function calculateResponseRate() {
  const statusData = analytics.applicationsByStatus || {};
  const total = Object.values(statusData).reduce((sum, count) => sum + count, 0);
  const responded = (statusData.accepted || 0) + (statusData.rejected || 0);
  return total > 0 ? `${((responded / total) * 100).toFixed(1)}% of applications processed` : 'No data available';
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

// ==================== INITIALIZATION ====================

// Initialize the app
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', async () => {
  // Check for existing session
  if (getSession()) {
    const isValid = await validateSession();
    if (!isValid) {
      window.location.hash = '#/login';
      return;
    }
  }
  
  route();
});

// Make functions globally accessible
window.openRoleModal = openRoleModal;
window.editRole = editRole;
window.deleteRole = deleteRole;
window.openSyncEventModal = openSyncEventModal;
window.syncSpecificEvent = syncSpecificEvent;
window.deleteEvent = deleteEvent;
window.handleLogout = handleLogout; 