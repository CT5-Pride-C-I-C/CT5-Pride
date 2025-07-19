// Complete Role Management System - CT5 Pride Admin
class AdminRoleManager {
    constructor() {
        this.roles = [];
        this.filteredRoles = [];
        this.editingRoleId = null;
        this.originalRoleData = null;
        
        // DOM elements
        this.passwordScreen = document.getElementById('passwordScreen');
        this.adminContent = document.getElementById('adminContent');
        this.roleFormSection = document.getElementById('roleFormSection');
        this.rolesTable = document.getElementById('rolesTable');
        this.deleteModal = document.getElementById('deleteModal');
        this.toastContainer = document.getElementById('toastContainer');
        
        // Admin password
        this.adminPassword = 'CT5Pride2024!';
        
        this.checkAuthentication();
        this.initializeDashboard();
        this.bindEvents();
        this.loadRoles();
    }

    // Authentication
    checkAuthentication() {
        const isAuthenticated = sessionStorage.getItem('ct5pride_admin_authenticated');
        
        if (isAuthenticated === 'true') {
            this.showAdminContent();
        } else {
            this.showPasswordScreen();
        }
    }

    showPasswordScreen() {
        this.passwordScreen.style.display = 'flex';
        this.adminContent.style.display = 'none';
    }

    showAdminContent() {
        this.passwordScreen.style.display = 'none';
        this.adminContent.style.display = 'block';
    }

    authenticate(password) {
        if (password === this.adminPassword) {
            sessionStorage.setItem('ct5pride_admin_authenticated', 'true');
            this.showAdminContent();
            return true;
        } else {
            return false;
        }
    }

    logout() {
        sessionStorage.removeItem('ct5pride_admin_authenticated');
        this.showPasswordScreen();
        this.hideForm();
    }

    // Dashboard Initialization
    initializeDashboard() {
        this.updateStats();
    }

    // Event Binding
    bindEvents() {
        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePasswordSubmit();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Dashboard buttons
        const addNewRoleBtn = document.getElementById('addNewRoleBtn');
        if (addNewRoleBtn) {
            addNewRoleBtn.addEventListener('click', () => {
                this.showForm();
            });
        }

        const refreshRolesBtn = document.getElementById('refreshRolesBtn');
        if (refreshRolesBtn) {
            refreshRolesBtn.addEventListener('click', () => {
                this.loadRoles();
            });
        }

        // Search and filters
        const roleSearch = document.getElementById('roleSearch');
        if (roleSearch) {
            roleSearch.addEventListener('input', () => {
                this.filterRoles();
            });
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.filterRoles();
            });
        }

        const departmentFilter = document.getElementById('departmentFilter');
        if (departmentFilter) {
            departmentFilter.addEventListener('change', () => {
                this.filterRoles();
            });
        }

        // Form events
        const roleForm = document.getElementById('roleForm');
        if (roleForm) {
            roleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRole();
            });
        }

        const closeFormBtn = document.getElementById('closeFormBtn');
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => {
                this.hideForm();
            });
        }

        // Delete modal
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }

        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        // Auto-generate ID from title
        const roleTitle = document.getElementById('roleTitle');
        if (roleTitle) {
            roleTitle.addEventListener('input', (e) => {
                const roleId = document.getElementById('roleId');
                if (roleId && !roleId.value.startsWith('custom-')) {
                    roleId.value = this.generateRoleId(e.target.value);
                }
            });
        }
    }

    // Password handling
    handlePasswordSubmit() {
        const passwordInput = document.getElementById('adminPassword');
        const passwordError = document.getElementById('passwordError');
        const password = passwordInput.value;

        if (this.authenticate(password)) {
            passwordError.style.display = 'none';
            passwordInput.value = '';
        } else {
            passwordError.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Role Loading
    async loadRoles() {
        try {
            this.showLoading();
            
            // Load roles from server API to get fresh data
            const response = await fetch('/api/roles');
            const result = await response.json();
            
            if (result.success) {
                this.roles = result.roles || [];
                console.log('📋 Loaded roles from server:', this.roles.map(r => r.id));
            } else {
                console.error('Failed to load roles:', result.message);
                this.showToast('Failed to load roles', 'error');
                this.roles = [];
            }
            
            this.filteredRoles = [...this.roles];
            this.renderRoles();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading roles:', error);
            this.showToast('Error loading roles', 'error');
            this.roles = [];
        } finally {
            this.hideLoading();
        }
    }

    // Role Rendering
    renderRoles() {
        if (this.filteredRoles.length === 0) {
            this.showNoRolesMessage();
            return;
        }

        const tableHTML = `
            <div class="roles-table-header">
                <div>Role Information</div>
                <div>Department</div>
                <div>Status</div>
                <div>Category</div>
                <div>Actions</div>
            </div>
            ${this.filteredRoles.map(role => this.renderRoleRow(role)).join('')}
        `;

        this.rolesTable.innerHTML = tableHTML;
        this.bindRoleRowEvents();
    }

    renderRoleRow(role) {
        const isEditing = this.editingRoleId === role.id;
        const statusClass = this.getStatusClass(role.status);
        const statusText = this.getStatusText(role.status);
        
        if (isEditing) {
            return this.renderEditingRow(role);
        }

        return `
            <div class="role-row ${role.status === 'closed' ? 'archived' : ''}" data-role-id="${role.id}">
                <div class="role-info">
                    <div class="role-title">${role.title}</div>
                    <div class="role-id">${role.id}</div>
                </div>
                <div class="role-department">${role.department}</div>
                <div class="role-status ${statusClass}">${statusText}</div>
                <div>${role.category}</div>
                <div class="role-actions">
                    <button class="edit-btn" data-role-id="${role.id}">✏️ Edit</button>
                    <button class="status-btn" data-role-id="${role.id}">📤 Status</button>
                    <button class="delete-btn" data-role-id="${role.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    renderEditingRow(role) {
        return `
            <div class="role-row editing" data-role-id="${role.id}">
                <div class="role-info">
                    <input type="text" class="edit-title" value="${role.title}" placeholder="Role Title">
                    <input type="text" class="edit-id" value="${role.id}" placeholder="Role ID">
                </div>
                <div>
                    <select class="edit-department">
                        <option value="Board of Directors" ${role.department === 'Board of Directors' ? 'selected' : ''}>Board of Directors</option>
                        <option value="Marketing & Communications" ${role.department === 'Marketing & Communications' ? 'selected' : ''}>Marketing & Communications</option>
                        <option value="Events & Operations" ${role.department === 'Events & Operations' ? 'selected' : ''}>Events & Operations</option>
                        <option value="Community Outreach" ${role.department === 'Community Outreach' ? 'selected' : ''}>Community Outreach</option>
                        <option value="Fundraising" ${role.department === 'Fundraising' ? 'selected' : ''}>Fundraising</option>
                        <option value="Youth Services" ${role.department === 'Youth Services' ? 'selected' : ''}>Youth Services</option>
                        <option value="Governance & Administration" ${role.department === 'Governance & Administration' ? 'selected' : ''}>Governance & Administration</option>
                        <option value="Volunteer Management" ${role.department === 'Volunteer Management' ? 'selected' : ''}>Volunteer Management</option>
                    </select>
                </div>
                <div>
                    <select class="edit-status">
                        <option value="draft" ${role.status === 'draft' ? 'selected' : ''}>Draft</option>
                        <option value="open" ${role.status === 'open' ? 'selected' : ''}>Live</option>
                        <option value="closed" ${role.status === 'closed' ? 'selected' : ''}>Archived</option>
                    </select>
                </div>
                <div>
                    <select class="edit-category">
                        <option value="governance" ${role.category === 'governance' ? 'selected' : ''}>Governance</option>
                        <option value="marketing" ${role.category === 'marketing' ? 'selected' : ''}>Marketing</option>
                        <option value="events" ${role.category === 'events' ? 'selected' : ''}>Events</option>
                        <option value="outreach" ${role.category === 'outreach' ? 'selected' : ''}>Outreach</option>
                        <option value="fundraising" ${role.category === 'fundraising' ? 'selected' : ''}>Fundraising</option>
                        <option value="youth" ${role.category === 'youth' ? 'selected' : ''}>Youth</option>
                    </select>
                </div>
                <div class="role-actions">
                    <button class="save-btn" data-role-id="${role.id}">💾 Save</button>
                    <button class="cancel-btn" data-role-id="${role.id}">❌ Cancel</button>
                </div>
            </div>
        `;
    }

    // Role Row Event Binding
    bindRoleRowEvents() {
        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleId = e.target.dataset.roleId;
                this.startEditing(roleId);
            });
        });

        // Status buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleId = e.target.dataset.roleId;
                this.toggleStatus(roleId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleId = e.target.dataset.roleId;
                console.log('🗑️ Delete button clicked for role:', roleId);
                this.showDeleteModal(roleId);
            });
        });

        // Save buttons (for editing)
        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleId = e.target.dataset.roleId;
                this.saveEditedRole(roleId);
            });
        });

        // Cancel buttons (for editing)
        document.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const roleId = e.target.dataset.roleId;
                this.cancelEditing(roleId);
            });
        });
    }

    // Inline Editing
    startEditing(roleId) {
        if (this.editingRoleId) {
            this.showToast('Please finish editing the current role first', 'warning');
            return;
        }

        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;

        this.editingRoleId = roleId;
        this.originalRoleData = { ...role };
        this.renderRoles();
    }

    async saveEditedRole(roleId) {
        const roleRow = document.querySelector(`[data-role-id="${roleId}"]`);
        if (!roleRow) return;

        const updatedRole = {
            ...this.roles.find(r => r.id === roleId),
            title: roleRow.querySelector('.edit-title').value,
            id: roleRow.querySelector('.edit-id').value,
            department: roleRow.querySelector('.edit-department').value,
            status: roleRow.querySelector('.edit-status').value,
            category: roleRow.querySelector('.edit-category').value
        };

        // Validate
        if (!updatedRole.title || !updatedRole.id) {
            this.showToast('Title and ID are required', 'error');
            return;
        }

        // Check for duplicate ID
        if (updatedRole.id !== roleId && this.roles.find(r => r.id === updatedRole.id)) {
            this.showToast('Role ID already exists', 'error');
            return;
        }

        try {
            await this.updateRole(roleId, updatedRole);
            this.editingRoleId = null;
            this.originalRoleData = null;
            this.loadRoles();
            this.showToast(`Role "${updatedRole.title}" updated successfully`, 'success');
        } catch (error) {
            this.showToast('Failed to update role', 'error');
        }
    }

    cancelEditing(roleId) {
        this.editingRoleId = null;
        this.originalRoleData = null;
        this.renderRoles();
    }

    // Status Management
    async toggleStatus(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;

        const statusMap = {
            'draft': 'open',
            'open': 'closed',
            'closed': 'draft'
        };

        const newStatus = statusMap[role.status];
        const updatedRole = { ...role, status: newStatus };

        try {
            await this.updateRole(roleId, updatedRole);
            this.loadRoles();
            this.showToast(`Status updated to ${this.getStatusText(newStatus)}`, 'success');
        } catch (error) {
            this.showToast('Failed to update status', 'error');
        }
    }

    // Role Operations
    async createRole(roleData) {
        try {
            const response = await fetch('/api/submit-role', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ roleData })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast(`Role "${roleData.title}" created successfully`, 'success');
                this.hideForm();
                this.loadRoles();
                return true;
            } else {
                this.showToast(result.message || 'Failed to create role', 'error');
                return false;
            }
        } catch (error) {
            this.showToast('Network error while creating role', 'error');
            return false;
        }
    }

    async updateRole(oldId, updatedRole) {
        try {
            const response = await fetch('/api/update-role', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    oldId, 
                    updatedRole 
                })
            });

            const result = await response.json();
            
            if (result.success) {
                return true;
            } else {
                throw new Error(result.message || 'Failed to update role');
            }
        } catch (error) {
            throw error;
        }
    }

    async deleteRole(roleId) {
        try {
            console.log('🗑️ Attempting to delete role:', roleId);
            const response = await fetch(`/api/delete-role/${roleId}`, {
                method: 'DELETE'
            });

            console.log('📡 Delete response status:', response.status);
            const result = await response.json();
            console.log('📡 Delete response:', result);
            
            if (result.success) {
                this.showToast('Role deleted successfully', 'success');
                this.loadRoles();
                return true;
            } else {
                this.showToast(result.message || 'Failed to delete role', 'error');
                return false;
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            this.showToast('Network error while deleting role', 'error');
            return false;
        }
    }

    // Form Management
    showForm(roleData = null) {
        this.roleFormSection.style.display = 'block';
        
        if (roleData) {
            // Edit mode
            document.getElementById('formTitle').textContent = '✏️ Edit Volunteer Role';
            this.populateForm(roleData);
        } else {
            // Create mode
            document.getElementById('formTitle').textContent = '🎯 Add New Volunteer Role';
            this.clearForm();
        }
        
        this.roleFormSection.scrollIntoView({ behavior: 'smooth' });
    }

    hideForm() {
        this.roleFormSection.style.display = 'none';
        this.clearForm();
    }

    clearForm() {
        const form = document.getElementById('roleForm');
        if (form) {
            form.reset();
            document.getElementById('roleId').value = this.generateRoleId();
            document.getElementById('roleStatus').value = 'draft';
            document.getElementById('roleIcon').value = 'volunteers';
        }
    }

    populateForm(roleData) {
        const form = document.getElementById('roleForm');
        if (!form) return;

        Object.keys(roleData).forEach(key => {
            const field = form.querySelector(`[name="role${key.charAt(0).toUpperCase() + key.slice(1)}"]`);
            if (field) {
                field.value = roleData[key];
            }
        });
    }

    async saveRole() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        // Check for duplicate ID
        if (this.roles.find(r => r.id === formData.id)) {
            this.showToast('Role ID already exists', 'error');
            return;
        }

        const success = await this.createRole(formData);
        if (success) {
            this.clearForm();
        }
    }

    getFormData() {
        const form = document.getElementById('roleForm');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key.replace('role', '').toLowerCase()] = value;
        }

        // Add criteria arrays
        data.essentialCriteria = this.getCriteriaArray('roleEssentialCriteria');
        data.desirableCriteria = this.getCriteriaArray('roleDesirableCriteria');

        return data;
    }

    getCriteriaArray(fieldId) {
        const textarea = document.getElementById(fieldId);
        if (!textarea) return [];
        
        return textarea.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    validateForm(data) {
        const requiredFields = ['title', 'id', 'department', 'category', 'summary', 'location', 'reportingLine', 'timeCommitment', 'description'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showToast(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 'error');
                return false;
            }
        }

        // Validate criteria arrays
        if (!data.essentialCriteria || data.essentialCriteria.length === 0) {
            this.showToast('At least one essential criteria is required', 'error');
            return false;
        }

        if (!data.desirableCriteria || data.desirableCriteria.length === 0) {
            this.showToast('At least one desirable criteria is required', 'error');
            return false;
        }

        return true;
    }

    // Delete Modal
    showDeleteModal(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) return;

        document.getElementById('deleteRoleTitle').textContent = role.title;
        this.deleteModal.style.display = 'flex';
        this.deleteModal.dataset.roleId = roleId;
    }

    hideDeleteModal() {
        this.deleteModal.style.display = 'none';
        delete this.deleteModal.dataset.roleId;
    }

    async confirmDelete() {
        const roleId = this.deleteModal.dataset.roleId;
        if (!roleId) return;

        await this.deleteRole(roleId);
        this.hideDeleteModal();
    }

    // Filtering and Search
    filterRoles() {
        const searchTerm = document.getElementById('roleSearch').value.toLowerCase();
        const statusFilter = document.getElementById('statusFilter').value;
        const departmentFilter = document.getElementById('departmentFilter').value;

        this.filteredRoles = this.roles.filter(role => {
            const matchesSearch = !searchTerm || 
                role.title.toLowerCase().includes(searchTerm) ||
                role.id.toLowerCase().includes(searchTerm) ||
                role.department.toLowerCase().includes(searchTerm);

            const matchesStatus = !statusFilter || role.status === statusFilter;
            const matchesDepartment = !departmentFilter || role.department === departmentFilter;

            return matchesSearch && matchesStatus && matchesDepartment;
        });

        this.renderRoles();
    }

    // Stats and UI Updates
    updateStats() {
        const total = this.roles.length;
        const live = this.roles.filter(r => r.status === 'open').length;
        const draft = this.roles.filter(r => r.status === 'draft').length;
        const archived = this.roles.filter(r => r.status === 'closed').length;

        document.getElementById('totalRoles').textContent = total;
        document.getElementById('liveRoles').textContent = live;
        document.getElementById('draftRoles').textContent = draft;
        document.getElementById('archivedRoles').textContent = archived;
    }

    showLoading() {
        document.getElementById('loadingRoles').style.display = 'block';
        document.getElementById('rolesTable').style.display = 'none';
        document.getElementById('noRolesMessage').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingRoles').style.display = 'none';
        document.getElementById('rolesTable').style.display = 'block';
    }

    showNoRolesMessage() {
        document.getElementById('noRolesMessage').style.display = 'block';
        document.getElementById('rolesTable').style.display = 'none';
    }

    // Utility Functions
    generateRoleId(title = '') {
        const baseTitle = title || document.getElementById('roleTitle')?.value || 'new-role';
        return 'custom-' + baseTitle.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    getStatusClass(status) {
        const statusMap = {
            'open': 'live',
            'draft': 'draft',
            'closed': 'archived'
        };
        return statusMap[status] || 'draft';
    }

    getStatusText(status) {
        const statusMap = {
            'open': 'Live',
            'draft': 'Draft',
            'closed': 'Archived'
        };
        return statusMap[status] || 'Draft';
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${this.getToastIcon(type)}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        this.toastContainer.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Initialize the admin system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminRoleManager();
}); 