// CT5 Pride Risk Register Management
// Handles risk CRUD operations, filtering, and risk assessment

console.log('🚀 CT5 PRIDE RISK REGISTER - Starting initialization');

// Supabase configuration
const SUPABASE_URL = 'https://rmhnrpwbgxyslfwttwzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaG5ycHdiZ3h5c2xmd3R0d3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQyMDcsImV4cCI6MjA2ODY5MDIwN30.yNlkzFMfvUCoN6IwEY4LgL6_ihdR_ux22oqvDnkWTxg';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state
let currentUser = null;
let risks = [];
let filteredRisks = [];

// Risk types for filtering
const RISK_TYPES = [
    'Financial', 'Operational', 'Strategic', 'Compliance', 'Reputational', 
    'Legal', 'Health & Safety', 'Technology', 'Environmental', 'Other'
];

// Residual risk levels
const RESIDUAL_RISK_LEVELS = [
    'Very Low', 'Low', 'Medium', 'High', 'Very High'
];

// ==================== AUTHENTICATION & SESSION MANAGEMENT ====================

function getSession() {
    return localStorage.getItem('ct5pride_admin_token');
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

function requireAuth() {
    if (!currentUser || !getSession()) {
        console.log('Authentication required, redirecting...');
        window.location.href = '/admin/';
        return false;
    }
    return true;
}

// ==================== UTILITY FUNCTIONS ====================

function showSuccess(message) {
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

function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error toast-show';
    toast.style.cssText = `
        position: fixed;
        top: 1.5rem;
        right: 1.5rem;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        padding: 1rem;
        transform: translateX(0);
        z-index: 1001;
        max-width: 400px;
        border-left: 4px solid #ef4444;
    `;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="font-size: 1.125rem; color: #ef4444;">❌</div>
            <div style="color: #374151;">${message}</div>
        </div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateRiskScore(likelihood, impact) {
    return likelihood * impact;
}

function getRiskScoreClass(score) {
    if (score >= 1 && score <= 4) return 'risk-score-1-4';
    if (score >= 5 && score <= 8) return 'risk-score-5-8';
    if (score >= 9 && score <= 12) return 'risk-score-9-12';
    if (score >= 13 && score <= 16) return 'risk-score-13-16';
    if (score >= 17 && score <= 25) return 'risk-score-17-25';
    return 'risk-score-1-4';
}

function getResidualRiskClass(level) {
    return `residual-${level.toLowerCase().replace(' ', '-')}`;
}

// ==================== NAVIGATION COMPONENT ====================

function renderNavigation() {
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
                <li>
                    <a href="/admin/" class="nav-link">
                        <span class="nav-icon">📊</span>
                        <span class="nav-label">Dashboard</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/risk_register.html" class="nav-link active" aria-current="page">
                        <span class="nav-icon">⚠️</span>
                        <span class="nav-label">Risk Register</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/#/roles" class="nav-link">
                        <span class="nav-icon">👥</span>
                        <span class="nav-label">Role Management</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/#/applications" class="nav-link">
                        <span class="nav-icon">📝</span>
                        <span class="nav-label">Applications</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/#/events" class="nav-link">
                        <span class="nav-icon">📅</span>
                        <span class="nav-label">Event Management</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/#/analytics" class="nav-link">
                        <span class="nav-icon">📈</span>
                        <span class="nav-label">Analytics</span>
                    </a>
                </li>
                <li>
                    <a href="/admin/#/memberships-list" class="nav-link">
                        <span class="nav-icon">🪪</span>
                        <span class="nav-label">Memberships</span>
                    </a>
                </li>
            </ul>
        </nav>
    `;
}

async function handleLogout() {
    console.log('Logging out user...');
    try {
        await supabase.auth.signOut();
        clearSession();
        localStorage.removeItem("supabaseSession");
        console.log('Logout successful, redirecting to main admin');
        showSuccess('Logged out successfully.');
        window.location.href = '/admin/';
    } catch (err) {
        console.error('Logout error:', err);
        clearSession();
        localStorage.removeItem("supabaseSession");
        window.location.href = '/admin/';
    }
}

// ==================== RISK REGISTER UI ====================

function renderRiskRegister() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="admin-layout">
            ${renderNavigation()}
            <main class="admin-content" id="main-content">
                <div class="page-header">
                    <h1>Risk Register</h1>
                    <p>Manage organizational risks, assessments, and mitigation strategies</p>
                    <div class="page-header-actions">
                        <div class="export-dropdown">
                            <button class="btn btn-secondary dropdown-toggle" id="exportBtn" onclick="toggleExportMenu()">📊 Export Data</button>
                            <div class="dropdown-menu" id="exportMenu" style="display: none;">
                                <button class="dropdown-item" onclick="exportToCSV()">📄 Export as CSV</button>
                                <button class="dropdown-item" onclick="exportToMarkdown()">📝 Export as Markdown</button>
                                <button class="dropdown-item" onclick="exportToJSON()">💾 Export as JSON</button>
                                <button class="dropdown-item" onclick="exportToPrintableHTML()">🖨️ Printable Report</button>
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="openRiskModal()">Add New Risk</button>
                    </div>
                </div>
                
                <!-- Risk Filters -->
                <div class="risk-filters">
                    <div class="filter-group">
                        <label for="risk-type-filter">Filter by Risk Type</label>
                        <select id="risk-type-filter" onchange="applyFilters()">
                            <option value="">All Risk Types</option>
                            ${RISK_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="residual-risk-filter">Filter by Residual Risk Level</label>
                        <select id="residual-risk-filter" onchange="applyFilters()">
                            <option value="">All Risk Levels</option>
                            ${RESIDUAL_RISK_LEVELS.map(level => `<option value="${level}">${level}</option>`).join('')}
                        </select>
                    </div>
                    <button class="btn btn-secondary" onclick="clearFilters()">Clear Filters</button>
                </div>
                
                <!-- Risk Table -->
                <div id="risks-content" class="risk-register-container">
                    <!-- Content will be loaded here -->
                </div>
            </main>
        </div>
    `;
    
    loadRisks();
}

async function loadRisks() {
    const content = document.getElementById('risks-content');
    
    if (!content) {
        console.error('Risk content container not found');
        return;
    }
    
    // Show loading state
    content.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #6b7280;">
            <div class="loading-spinner" style="margin: 0 auto 1rem auto;"></div>
            <p>Loading risks...</p>
        </div>
    `;
    
    try {
        console.log('Fetching risks from API...');
        const response = await fetch('/api/risks', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getSession()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                // Authentication failed, redirect to login
                window.location.href = '/admin/';
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch risks');
        }
        
        console.log('Risks loaded successfully:', data.risks);
        risks = data.risks || [];
        filteredRisks = [...risks];
        
        renderRisksTable();
        
    } catch (err) {
        console.error('Load risks error:', err);
        content.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #ef4444;">
                <h3>⚠️ Error Loading Risks</h3>
                <p>Failed to load risk data: ${err.message}</p>
                <button class="btn btn-primary" onclick="loadRisks()">Retry</button>
            </div>
        `;
    }
}

function renderRisksTable() {
    const content = document.getElementById('risks-content');
    
    if (filteredRisks.length === 0) {
        const isEmpty = risks.length === 0;
        content.innerHTML = `
            <div class="no-risks">
                <h3>${isEmpty ? 'No risks found' : 'No risks match current filters'}</h3>
                <p>${isEmpty ? 'Start by creating your first risk assessment.' : 'Try adjusting your filter criteria.'}</p>
                ${isEmpty ? '<button class="btn btn-primary" onclick="openRiskModal()">Add First Risk</button>' : ''}
            </div>
        `;
        return;
    }
    
    content.innerHTML = `
        <div class="risk-table-container">
            <table class="risk-table">
                <thead>
                    <tr>
                        <th>Risk ID</th>
                        <th>Title</th>
                        <th>Risk Type</th>
                        <th>Likelihood</th>
                        <th>Impact</th>
                        <th>Score</th>
                        <th>Residual Risk Level</th>
                        <th>Mitigation</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredRisks.map(risk => `
                        <tr>
                            <td><strong>${risk.risk_id || 'N/A'}</strong></td>
                            <td>
                                <strong>${risk.title || 'Untitled Risk'}</strong>
                                ${risk.description ? `<br><small style="color: #6b7280;">${risk.description.substring(0, 80)}${risk.description.length > 80 ? '...' : ''}</small>` : ''}
                            </td>
                            <td>${risk.risk_type || 'N/A'}</td>
                            <td style="text-align: center;">${risk.likelihood || 'N/A'}</td>
                            <td style="text-align: center;">${risk.impact || 'N/A'}</td>
                            <td style="text-align: center;">
                                <span class="risk-score-badge ${getRiskScoreClass(risk.score || 0)}">
                                    ${risk.score || 0}
                                </span>
                            </td>
                            <td>
                                <span class="residual-risk-badge ${getResidualRiskClass(risk.residual_risk_level || 'Low')}">
                                    ${risk.residual_risk_level || 'N/A'}
                                </span>
                            </td>
                            <td>
                                <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                                    ${risk.mitigation ? risk.mitigation.substring(0, 100) : 'No mitigation specified'}${risk.mitigation && risk.mitigation.length > 100 ? '...' : ''}
                                </div>
                            </td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-edit" onclick="editRisk('${risk.id}')" title="Edit Risk">
                                        ✏️ Edit
                                    </button>
                                    <button class="btn-delete" onclick="deleteRisk('${risk.id}')" title="Delete Risk">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ==================== FILTERING ====================

function applyFilters() {
    const riskTypeFilter = document.getElementById('risk-type-filter').value;
    const residualRiskFilter = document.getElementById('residual-risk-filter').value;
    
    filteredRisks = risks.filter(risk => {
        const matchesType = !riskTypeFilter || risk.risk_type === riskTypeFilter;
        const matchesLevel = !residualRiskFilter || risk.residual_risk_level === residualRiskFilter;
        return matchesType && matchesLevel;
    });
    
    console.log(`Applied filters: ${filteredRisks.length}/${risks.length} risks match`);
    renderRisksTable();
}

function clearFilters() {
    document.getElementById('risk-type-filter').value = '';
    document.getElementById('residual-risk-filter').value = '';
    filteredRisks = [...risks];
    renderRisksTable();
}

// ==================== RISK MODAL & FORM ====================

function openRiskModal(riskId = null) {
    const isEdit = riskId !== null;
    const risk = isEdit ? risks.find(r => r.id === riskId) : {};
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 700px;">
            <div class="modal-header">
                <h2>${isEdit ? 'Edit Risk' : 'Add New Risk'}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            </div>
            <form class="modal-form" onsubmit="handleRiskSubmit(event, ${riskId ? `'${riskId}'` : 'null'})">
                <div class="form-group">
                    <label>Risk ID *</label>
                    <input type="text" name="risk_id" value="${risk.risk_id || ''}" required 
                           placeholder="e.g. RISK-001, OP-2024-01">
                    <small class="form-help">Unique identifier for this risk</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Title *</label>
                        <input type="text" name="title" value="${risk.title || ''}" required
                               placeholder="Brief risk title">
                    </div>
                    <div class="form-group">
                        <label>Risk Type *</label>
                        <select name="risk_type" required>
                            <option value="">Select risk type</option>
                            ${RISK_TYPES.map(type => `
                                <option value="${type}" ${risk.risk_type === type ? 'selected' : ''}>${type}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="3" 
                              placeholder="Detailed description of the risk">${risk.description || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Likelihood (1-5) *</label>
                        <select name="likelihood" required onchange="updateRiskScore()">
                            <option value="">Select</option>
                            ${[1,2,3,4,5].map(val => `
                                <option value="${val}" ${risk.likelihood == val ? 'selected' : ''}>${val}</option>
                            `).join('')}
                        </select>
                        <small class="form-help">1 = Very Unlikely, 5 = Very Likely</small>
                    </div>
                    <div class="form-group">
                        <label>Impact (1-5) *</label>
                        <select name="impact" required onchange="updateRiskScore()">
                            <option value="">Select</option>
                            ${[1,2,3,4,5].map(val => `
                                <option value="${val}" ${risk.impact == val ? 'selected' : ''}>${val}</option>
                            `).join('')}
                        </select>
                        <small class="form-help">1 = Very Low Impact, 5 = Very High Impact</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Risk Score (Auto-calculated)</label>
                    <div class="score-display" id="risk-score-display">
                        ${risk.score || 'Select likelihood and impact'}
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Mitigation Strategy</label>
                    <textarea name="mitigation" rows="3" 
                              placeholder="Describe mitigation actions and controls">${risk.mitigation || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Residual Risk Level *</label>
                    <select name="residual_risk_level" required>
                        <option value="">Select residual risk level</option>
                        ${RESIDUAL_RISK_LEVELS.map(level => `
                            <option value="${level}" ${risk.residual_risk_level === level ? 'selected' : ''}>${level}</option>
                        `).join('')}
                    </select>
                    <small class="form-help">Risk level after mitigation controls are applied</small>
                </div>
                
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Create'} Risk</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize score if editing
    if (isEdit && risk.likelihood && risk.impact) {
        setTimeout(() => updateRiskScore(), 100);
    }
}

function updateRiskScore() {
    const likelihoodSelect = document.querySelector('select[name="likelihood"]');
    const impactSelect = document.querySelector('select[name="impact"]');
    const scoreDisplay = document.getElementById('risk-score-display');
    
    if (!likelihoodSelect || !impactSelect || !scoreDisplay) return;
    
    const likelihood = parseInt(likelihoodSelect.value) || 0;
    const impact = parseInt(impactSelect.value) || 0;
    
    if (likelihood && impact) {
        const score = calculateRiskScore(likelihood, impact);
        scoreDisplay.textContent = score;
        scoreDisplay.className = `score-display ${getRiskScoreClass(score)}`;
        scoreDisplay.style.color = 'white';
    } else {
        scoreDisplay.textContent = 'Select likelihood and impact';
        scoreDisplay.className = 'score-display';
        scoreDisplay.style.color = '#ff6f91';
    }
}

async function handleRiskSubmit(event, riskId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const riskData = Object.fromEntries(formData.entries());
    
    // Calculate score
    riskData.likelihood = parseInt(riskData.likelihood);
    riskData.impact = parseInt(riskData.impact);
    riskData.score = calculateRiskScore(riskData.likelihood, riskData.impact);
    
    // Validate required fields
    if (!riskData.risk_id || !riskData.title || !riskData.risk_type || 
        !riskData.likelihood || !riskData.impact || !riskData.residual_risk_level) {
        showError('Please fill in all required fields');
        return;
    }
    
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        const isEdit = riskId !== null;
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Updating...' : 'Creating...';
        
        const url = riskId ? `/api/risks/${riskId}` : '/api/risks';
        const method = riskId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${getSession()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(riskData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/';
                return;
            }
            throw new Error(result.message || `HTTP ${response.status}`);
        }
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to save risk');
        }
        
        showSuccess(riskId ? 'Risk updated successfully!' : 'Risk created successfully!');
        document.querySelector('.modal-overlay').remove();
        await loadRisks();
        
    } catch (err) {
        console.error('Risk save error:', err);
        showError(`Failed to save risk: ${err.message}`);
        
        // Reset button
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = riskId ? 'Update Risk' : 'Create Risk';
    }
}

// ==================== RISK MANAGEMENT ====================

async function editRisk(riskId) {
    openRiskModal(riskId);
}

async function deleteRisk(riskId) {
    const risk = risks.find(r => r.id === riskId);
    if (!risk) {
        showError('Risk not found');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete the risk "${risk.title}"?\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/risks/${riskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${getSession()}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/';
                return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || 'Failed to delete risk');
        }
        
        showSuccess('Risk deleted successfully!');
        await loadRisks();
        
    } catch (err) {
        console.error('Risk delete error:', err);
        showError(`Failed to delete risk: ${err.message}`);
    }
}

// ==================== EXPORT FUNCTIONALITY ====================

function toggleExportMenu() {
    const menu = document.getElementById('exportMenu');
    if (menu.style.display === 'none') {
        menu.style.display = 'block';
        // Hide menu when clicking elsewhere
        setTimeout(() => {
            document.addEventListener('click', hideExportMenu);
        }, 0);
    } else {
        menu.style.display = 'none';
    }
}

function hideExportMenu(event) {
    const menu = document.getElementById('exportMenu');
    const button = document.getElementById('exportBtn');
    
    if (!menu.contains(event.target) && !button.contains(event.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', hideExportMenu);
    }
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatDateForExport(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function exportToCSV() {
    console.log('Exporting risks to CSV...');
    
    if (!filteredRisks || filteredRisks.length === 0) {
        showError('No risks to export. Please ensure risks are loaded.');
        return;
    }
    
    // CSV headers
    const headers = [
        'Risk ID',
        'Title',
        'Description',
        'Risk Type',
        'Likelihood',
        'Impact',
        'Score',
        'Mitigation',
        'Residual Risk Level',
        'Created Date',
        'Updated Date'
    ];
    
    // Convert risks to CSV format
    const csvContent = [
        headers.join(','),
        ...filteredRisks.map(risk => [
            `"${(risk.risk_id || '').replace(/"/g, '""')}"`,
            `"${(risk.title || '').replace(/"/g, '""')}"`,
            `"${(risk.description || '').replace(/"/g, '""')}"`,
            `"${(risk.risk_type || '').replace(/"/g, '""')}"`,
            risk.likelihood || '',
            risk.impact || '',
            risk.score || '',
            `"${(risk.mitigation || '').replace(/"/g, '""')}"`,
            `"${(risk.residual_risk_level || '').replace(/"/g, '""')}"`,
            formatDateForExport(risk.created_at),
            formatDateForExport(risk.updated_at)
        ].join(','))
    ].join('\n');
    
    const filename = `CT5_Pride_Risk_Register_${new Date().toISOString().split('T')[0]}.csv`;
    downloadFile(csvContent, filename, 'text/csv');
    
    hideExportMenu();
    showSuccess(`Risk register exported to ${filename}`);
}

function exportToMarkdown() {
    console.log('Exporting risks to Markdown...');
    
    if (!filteredRisks || filteredRisks.length === 0) {
        showError('No risks to export. Please ensure risks are loaded.');
        return;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    let markdown = `# CT5 Pride Risk Register\n\n`;
    markdown += `**Generated:** ${dateStr}\n`;
    markdown += `**Total Risks:** ${filteredRisks.length}\n\n`;
    
    // Add summary statistics
    const risksByType = {};
    const risksByLevel = {};
    filteredRisks.forEach(risk => {
        risksByType[risk.risk_type] = (risksByType[risk.risk_type] || 0) + 1;
        risksByLevel[risk.residual_risk_level] = (risksByLevel[risk.residual_risk_level] || 0) + 1;
    });
    
    markdown += `## Summary\n\n`;
    markdown += `### Risks by Type\n`;
    Object.entries(risksByType).forEach(([type, count]) => {
        markdown += `- **${type}:** ${count}\n`;
    });
    
    markdown += `\n### Risks by Residual Level\n`;
    Object.entries(risksByLevel).forEach(([level, count]) => {
        markdown += `- **${level}:** ${count}\n`;
    });
    
    markdown += `\n## Risk Details\n\n`;
    
    // Sort risks by score (highest first)
    const sortedRisks = [...filteredRisks].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    sortedRisks.forEach((risk, index) => {
        markdown += `### ${index + 1}. ${risk.title || 'Untitled Risk'}\n\n`;
        markdown += `- **Risk ID:** ${risk.risk_id || 'N/A'}\n`;
        markdown += `- **Type:** ${risk.risk_type || 'N/A'}\n`;
        markdown += `- **Likelihood:** ${risk.likelihood || 'N/A'}/5\n`;
        markdown += `- **Impact:** ${risk.impact || 'N/A'}/5\n`;
        markdown += `- **Risk Score:** ${risk.score || 'N/A'}\n`;
        markdown += `- **Residual Risk Level:** ${risk.residual_risk_level || 'N/A'}\n`;
        
        if (risk.description) {
            markdown += `\n**Description:** ${risk.description}\n`;
        }
        
        if (risk.mitigation) {
            markdown += `\n**Mitigation Strategy:** ${risk.mitigation}\n`;
        }
        
        markdown += `\n**Created:** ${formatDateForExport(risk.created_at)}\n`;
        markdown += `**Updated:** ${formatDateForExport(risk.updated_at)}\n\n`;
        markdown += `---\n\n`;
    });
    
    markdown += `\n*Report generated by CT5 Pride Risk Management System*\n`;
    
    const filename = `CT5_Pride_Risk_Register_${new Date().toISOString().split('T')[0]}.md`;
    downloadFile(markdown, filename, 'text/markdown');
    
    hideExportMenu();
    showSuccess(`Risk register exported to ${filename}`);
}

function exportToJSON() {
    console.log('Exporting risks to JSON...');
    
    if (!filteredRisks || filteredRisks.length === 0) {
        showError('No risks to export. Please ensure risks are loaded.');
        return;
    }
    
    const exportData = {
        metadata: {
            generated_at: new Date().toISOString(),
            generated_by: 'CT5 Pride Risk Management System',
            total_risks: filteredRisks.length,
            export_version: '1.0'
        },
        risks: filteredRisks.map(risk => ({
            id: risk.id,
            risk_id: risk.risk_id,
            title: risk.title,
            description: risk.description,
            risk_type: risk.risk_type,
            likelihood: risk.likelihood,
            impact: risk.impact,
            score: risk.score,
            mitigation: risk.mitigation,
            residual_risk_level: risk.residual_risk_level,
            created_at: risk.created_at,
            updated_at: risk.updated_at
        }))
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const filename = `CT5_Pride_Risk_Register_${new Date().toISOString().split('T')[0]}.json`;
    downloadFile(jsonContent, filename, 'application/json');
    
    hideExportMenu();
    showSuccess(`Risk register exported to ${filename}`);
}

function exportToPrintableHTML() {
    console.log('Generating printable HTML report...');
    
    if (!filteredRisks || filteredRisks.length === 0) {
        showError('No risks to export. Please ensure risks are loaded.');
        return;
    }
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Sort risks by score (highest first)
    const sortedRisks = [...filteredRisks].sort((a, b) => (b.score || 0) - (a.score || 0));
    
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CT5 Pride Risk Register Report</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #374151;
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
                background: white;
            }
            .header {
                text-align: center;
                margin-bottom: 3rem;
                padding-bottom: 2rem;
                border-bottom: 3px solid #ff6f91;
            }
            .header h1 {
                color: #ff6f91;
                font-size: 2.5rem;
                margin: 0;
            }
            .header p {
                color: #6b7280;
                font-size: 1.1rem;
                margin: 0.5rem 0;
            }
            .summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            .summary-card {
                background: #f9fafb;
                padding: 1.5rem;
                border-radius: 8px;
                border-left: 4px solid #ff6f91;
            }
            .summary-card h3 {
                margin: 0 0 1rem 0;
                color: #374151;
            }
            .risk-item {
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1.5rem;
                margin-bottom: 1.5rem;
                page-break-inside: avoid;
            }
            .risk-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 1rem;
            }
            .risk-title {
                font-size: 1.25rem;
                font-weight: 600;
                color: #111827;
                margin: 0;
            }
            .risk-score {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 40px;
                height: 40px;
                border-radius: 50%;
                font-weight: 600;
                color: white;
                font-size: 1rem;
            }
            .score-1-4 { background-color: #22c55e; }
            .score-5-8 { background-color: #84cc16; }
            .score-9-12 { background-color: #eab308; }
            .score-13-16 { background-color: #f97316; }
            .score-17-25 { background-color: #ef4444; }
            .risk-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin-bottom: 1rem;
                font-size: 0.9rem;
            }
            .meta-item {
                display: flex;
                flex-direction: column;
            }
            .meta-label {
                font-weight: 600;
                color: #6b7280;
                margin-bottom: 0.25rem;
            }
            .meta-value {
                color: #374151;
            }
            .risk-description, .risk-mitigation {
                margin: 1rem 0;
                padding: 1rem;
                background: #f9fafb;
                border-radius: 6px;
                border-left: 3px solid #ff6f91;
            }
            .section-title {
                font-weight: 600;
                color: #374151;
                margin: 0 0 0.5rem 0;
            }
            @media print {
                body { padding: 1rem; }
                .risk-item { page-break-inside: avoid; }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏳️‍🌈 CT5 Pride Risk Register</h1>
            <p>Comprehensive Risk Assessment Report</p>
            <p><strong>Generated:</strong> ${dateStr}</p>
            <p><strong>Total Risks:</strong> ${sortedRisks.length}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>📊 Risk Distribution</h3>
                ${Object.entries(sortedRisks.reduce((acc, risk) => {
                    const level = risk.residual_risk_level || 'Unknown';
                    acc[level] = (acc[level] || 0) + 1;
                    return acc;
                }, {})).map(([level, count]) => 
                    `<p><strong>${level}:</strong> ${count}</p>`
                ).join('')}
            </div>
            <div class="summary-card">
                <h3>🏷️ Risk Categories</h3>
                ${Object.entries(sortedRisks.reduce((acc, risk) => {
                    const type = risk.risk_type || 'Unknown';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {})).map(([type, count]) => 
                    `<p><strong>${type}:</strong> ${count}</p>`
                ).join('')}
            </div>
        </div>
        
        <h2>📋 Risk Details (Sorted by Score)</h2>
        
        ${sortedRisks.map((risk, index) => `
            <div class="risk-item">
                <div class="risk-header">
                    <h3 class="risk-title">${risk.title || 'Untitled Risk'}</h3>
                    <div class="risk-score score-${getRiskScoreClass(risk.score || 0).replace('risk-score-', '')}">${risk.score || 0}</div>
                </div>
                
                <div class="risk-meta">
                    <div class="meta-item">
                        <div class="meta-label">Risk ID</div>
                        <div class="meta-value">${risk.risk_id || 'N/A'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Type</div>
                        <div class="meta-value">${risk.risk_type || 'N/A'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Likelihood</div>
                        <div class="meta-value">${risk.likelihood || 'N/A'}/5</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Impact</div>
                        <div class="meta-value">${risk.impact || 'N/A'}/5</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Residual Level</div>
                        <div class="meta-value">${risk.residual_risk_level || 'N/A'}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Last Updated</div>
                        <div class="meta-value">${formatDateForExport(risk.updated_at)}</div>
                    </div>
                </div>
                
                ${risk.description ? `
                    <div class="risk-description">
                        <div class="section-title">📝 Description</div>
                        <div>${risk.description}</div>
                    </div>
                ` : ''}
                
                ${risk.mitigation ? `
                    <div class="risk-mitigation">
                        <div class="section-title">🛡️ Mitigation Strategy</div>
                        <div>${risk.mitigation}</div>
                    </div>
                ` : ''}
            </div>
        `).join('')}
        
        <div style="margin-top: 3rem; text-align: center; color: #6b7280; font-size: 0.9rem;">
            <p><em>Report generated by CT5 Pride Risk Management System</em></p>
        </div>
    </body>
    </html>`;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Optional: Auto-trigger print dialog
    printWindow.onload = function() {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
    
    hideExportMenu();
    showSuccess('Printable report generated in new window');
}

// ==================== GLOBAL FUNCTIONS ====================

// Make functions globally available
window.openRiskModal = openRiskModal;
window.handleRiskSubmit = handleRiskSubmit;
window.updateRiskScore = updateRiskScore;
window.editRisk = editRisk;
window.deleteRisk = deleteRisk;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.handleLogout = handleLogout;
window.loadRisks = loadRisks;
window.toggleExportMenu = toggleExportMenu;
window.exportToCSV = exportToCSV;
window.exportToMarkdown = exportToMarkdown;
window.exportToJSON = exportToJSON;
window.exportToPrintableHTML = exportToPrintableHTML;

// ==================== APP INITIALIZATION ====================

window.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Risk Register - DOMContentLoaded');
    
    const app = document.getElementById('app');
    if (!app) {
        console.error('App container not found!');
        return;
    }
    
    // Show loading state
    app.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <h2>🏳️‍🌈 Loading Risk Register</h2>
            <p>Checking authentication and preparing dashboard...</p>
        </div>
    `;
    
    try {
        // Check for existing session first
        console.log('Checking for existing Supabase session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.warn('Session check error:', error.message);
            throw error;
        }
        
        if (data?.session?.user) {
            console.log('✅ Valid session found, user authenticated');
            currentUser = data.session.user;
            
            // Store session for backup
            localStorage.setItem('ct5pride_admin_token', data.session.access_token);
            localStorage.setItem("supabase-session", JSON.stringify(data.session));
            
            // Render risk register
            renderRiskRegister();
            return;
        }
        
        // Try to restore from localStorage
        const storedSession = localStorage.getItem("supabase-session");
        if (storedSession) {
            console.log('Attempting to restore session from storage...');
            
            try {
                const sessionData = JSON.parse(storedSession);
                if (sessionData?.access_token && sessionData?.refresh_token) {
                    const { data: restoredData, error: restoreError } = await supabase.auth.setSession({
                        access_token: sessionData.access_token,
                        refresh_token: sessionData.refresh_token
                    });
                    
                    if (!restoreError && restoredData?.session?.user) {
                        console.log('✅ Successfully restored session');
                        currentUser = restoredData.session.user;
                        localStorage.setItem('ct5pride_admin_token', restoredData.session.access_token);
                        
                        renderRiskRegister();
                        return;
                    }
                }
            } catch (parseError) {
                console.warn('Failed to parse stored session:', parseError.message);
                localStorage.removeItem("supabase-session");
            }
        }
        
        // No valid session found
        console.log('❌ No valid authentication found');
        throw new Error('Authentication required');
        
    } catch (authError) {
        console.error('Authentication error:', authError);
        
        // Clear any invalid session data
        localStorage.removeItem('ct5pride_admin_token');
        localStorage.removeItem("supabase-session");
        
        // Show authentication error and redirect
        app.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: #ef4444;">
                <h2>🔐 Authentication Required</h2>
                <p>You need to be logged in to access the Risk Register.</p>
                <p style="color: #6b7280; font-size: 0.875rem;">Error: ${authError.message}</p>
                <div style="margin-top: 1.5rem;">
                    <a href="/admin/" class="btn btn-primary" style="background: #ff6f91; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 8px; display: inline-block;">
                        Go to Admin Login
                    </a>
                </div>
            </div>
        `;
        
        // Redirect after showing message
        setTimeout(() => {
            window.location.href = '/admin/';
        }, 3000);
    }
});

console.log('✅ Risk Register JavaScript loaded successfully'); 