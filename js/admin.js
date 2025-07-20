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
        
        // DOM elements initialized successfully
        
        // Admin password
        this.adminPassword = 'CT5Pride2024!';
        
        this.checkAuthentication();
        this.initializeDashboard();
        this.bindEvents();
        this.loadRoles();
        this.initializeStatusIndicators();
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
            console.log('🔄 Loading roles...');
            
            // Try to load roles from server API first (for local development)
            try {
                const response = await fetch('/api/roles');
                const result = await response.json();
                
                if (result.success && result.roles) {
                    this.roles = result.roles;
                } else {
                    throw new Error('Invalid data format from server API');
                }
            } catch (serverError) {
                // Fallback: Load roles directly from config.js
                try {
                    const configModule = await import('./config.js');
                    this.roles = configModule.roles || [];
                } catch (configError) {
                    console.error('❌ Failed to load roles from config.js:', configError);
                    this.showToast('Failed to load roles from config file', 'error');
                    this.roles = [];
                }
            }
            
            this.filteredRoles = [...this.roles];
            this.renderRoles();
            this.updateStats();
            
        } catch (error) {
            console.error('❌ Error loading roles:', error);
            this.showToast('Error loading roles', 'error');
            this.roles = [];
        } finally {
            this.hideLoading();
        }
    }

    // Role Rendering
    renderRoles() {
        if (!this.rolesTable) {
            console.error('❌ rolesTable element not found!');
            return;
        }
        
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
        this.bindDeleteButtons(); // Ensure delete buttons are properly bound
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
                    <button class="edit-btn" data-role-id="${role.id}" title="Edit role" aria-label="Edit ${role.title}">✏️ Edit</button>
                    <button class="status-btn" data-role-id="${role.id}" title="Change status" aria-label="Change status for ${role.title}">📤 Status</button>
                    <button class="delete-btn" data-role-id="${role.id}" title="Delete role" aria-label="Delete ${role.title}">🗑️ Delete</button>
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
        // Use event delegation for better reliability
        const rolesTable = this.rolesTable;
        
        // Remove existing event listeners to prevent duplicates
        rolesTable.removeEventListener('click', this.handleTableClick);
        
        // Add single event listener for all button clicks
        rolesTable.addEventListener('click', this.handleTableClick.bind(this));
    }

    // Bind delete buttons specifically (backup method)
    bindDeleteButtons() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        
        deleteButtons.forEach((btn) => {
            // Remove any existing listeners to prevent duplicates
            btn.removeEventListener('click', this.handleDeleteClick);
            btn.addEventListener('click', this.handleDeleteClick.bind(this));
        });
    }

    // Individual delete button handler (backup method)
    handleDeleteClick(event) {
        const roleId = event.currentTarget.getAttribute('data-role-id');
        this.handleDelete(roleId);
    }

    // Event delegation handler for all table button clicks
    handleTableClick(e) {
        const target = e.target;
        
        // Edit buttons
        if (target.classList.contains('edit-btn')) {
            const roleId = target.dataset.roleId;
            this.startEditing(roleId);
        }
        
        // Status buttons
        else if (target.classList.contains('status-btn')) {
            const roleId = target.dataset.roleId;
            this.toggleStatus(roleId);
        }
        
        // Delete buttons
        else if (target.classList.contains('delete-btn')) {
            const roleId = target.dataset.roleId;
            this.handleDelete(roleId);
        }
        
        // Save buttons (for editing)
        else if (target.classList.contains('save-btn')) {
            const roleId = target.dataset.roleId;
            this.saveEditedRole(roleId);
        }
        
        // Cancel buttons (for editing)
        else if (target.classList.contains('cancel-btn')) {
            const roleId = target.dataset.roleId;
            this.cancelEditing(roleId);
        }
    }

    // Enhanced delete handler with confirmation and loading state
    async handleDelete(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) {
            this.showToast('Role not found', 'error');
            return;
        }

        // Show confirmation dialog
        const confirmed = confirm(`Are you sure you want to delete role "${role.title}"? This cannot be undone.`);
        if (!confirmed) {
            return;
        }

        // Find the delete button and show loading state
        const deleteBtn = document.querySelector(`[data-role-id="${roleId}"].delete-btn`);
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '⏳ Deleting...';
        }

        try {
            const response = await fetch(`/api/delete-role/${roleId}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showToast(`✅ Role "${role.title}" deleted successfully!`, 'success');
                this.loadRoles(); // Re-render the role list
            } else {
                this.showToast(`❌ Delete failed: ${result.message || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            this.showToast('❌ Delete failed due to network or server error', 'error');
        } finally {
            // Reset button state
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = '🗑️ Delete';
            }
        }
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
            // Try server API first (for local development)
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
                    throw new Error(result.message || 'Server create failed');
                }
            } catch (serverError) {
                this.showToast('Create functionality requires server connection. Please use local development server for full CRUD operations.', 'warning');
                return false;
            }
        } catch (error) {
            console.error('❌ Create error:', error);
            this.showToast('Error creating role', 'error');
            return false;
        }
    }

    async updateRole(oldId, updatedRole) {
        try {
            // Try server API first (for local development)
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
                    throw new Error(result.message || 'Server update failed');
                }
            } catch (serverError) {
                console.log('🔄 Server API not available, showing offline message');
                this.showToast('Update functionality requires server connection. Please use local development server for full CRUD operations.', 'warning');
                return false;
            }
        } catch (error) {
            throw error;
        }
    }

    async deleteRole(roleId) {
        try {
            console.log('🗑️ Attempting to delete role:', roleId);
            
            // Try server API first (for local development)
            try {
                const response = await fetch(`/api/delete-role/${roleId}`, {
                    method: 'DELETE'
                });

                console.log('📡 Delete response status:', response.status);
                const result = await response.json();
                console.log('📡 Delete response:', result);
                
                if (result.success) {
                    console.log('✅ Role deleted successfully:', roleId);
                    this.showToast('Role deleted successfully', 'success');
                    this.loadRoles();
                    return true;
                } else {
                    console.error('❌ Server returned error:', result.message);
                    this.showToast(result.message || 'Delete failed. Please try again.', 'error');
                    return false;
                }
            } catch (serverError) {
                console.log('🔄 Server API not available, showing offline message');
                this.showToast('Delete functionality requires server connection. Please use local development server for full CRUD operations.', 'warning');
                return false;
            }
        } catch (error) {
            console.error('❌ Delete error:', error);
            this.showToast('Delete failed. Please try again.', 'error');
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
            // Remove 'role' prefix and convert to camelCase
            const fieldName = key.replace('role', '');
            const camelCaseName = fieldName.charAt(0).toLowerCase() + fieldName.slice(1);
            data[camelCaseName] = value;
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
        console.log('🔍 Validating form data:', data);
        
        const requiredFields = ['title', 'id', 'department', 'category', 'summary', 'location', 'reportingLine', 'timeCommitment', 'description'];
        
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                console.log(`❌ Missing or empty field: ${field}, value: "${data[field]}"`);
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

        console.log('✅ Form validation passed');
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

    // Status Indicators
    initializeStatusIndicators() {
        this.updateDateTime();
        this.updateBannerRoleCount();
        
        // Update date/time every second
        setInterval(() => {
            this.updateDateTime();
        }, 1000);
    }

    updateDateTime() {
        const dateTimeElement = document.getElementById('currentDateTime');
        if (dateTimeElement) {
            const now = new Date();
            const options = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            };
            dateTimeElement.textContent = now.toLocaleDateString('en-GB', options);
        }
    }

    updateBannerRoleCount() {
        const bannerRoleCount = document.getElementById('bannerRoleCount');
        if (bannerRoleCount) {
            bannerRoleCount.textContent = this.roles.length;
        }
    }

    // Override updateStats to also update banner count
    updateStats() {
        const total = this.roles.length;
        const live = this.roles.filter(r => r.status === 'open').length;
        const draft = this.roles.filter(r => r.status === 'draft').length;
        const archived = this.roles.filter(r => r.status === 'closed').length;

        document.getElementById('totalRoles').textContent = total;
        document.getElementById('liveRoles').textContent = live;
        document.getElementById('draftRoles').textContent = draft;
        document.getElementById('archivedRoles').textContent = archived;
        
        // Update banner role count
        this.updateBannerRoleCount();
    }
}

// Initialize the admin system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminRoleManager();
}); 