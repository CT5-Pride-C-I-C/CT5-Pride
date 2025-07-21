// Complete Role Management System - CT5 Pride Admin
class AdminRoleManager {
    constructor() {
        this.roles = [];
        this.filteredRoles = [];
        this.editingRoleId = null;
        this.originalRoleData = null;
        
        // Events management
        this.events = [];
        this.filteredEvents = [];
        this.currentEventData = null;
        
        // Applications management
        this.applications = [];
        this.filteredApplications = [];
        this.currentApplicationId = null;
        
        // DOM elements
        this.passwordScreen = document.getElementById('passwordScreen');
        this.adminContent = document.getElementById('adminContent');
        this.roleFormSection = document.getElementById('roleFormSection');
        this.rolesTable = document.getElementById('rolesTable');
        this.deleteModal = document.getElementById('deleteModal');
        this.toastContainer = document.getElementById('toastContainer');
        
        // Events DOM elements
        this.eventFormSection = document.getElementById('eventFormSection');
        this.eventsTable = document.getElementById('eventsTable');
        
        // Applications DOM elements
        this.applicationsTable = document.getElementById('applicationsTable');
        this.applicationModal = document.getElementById('applicationModal');
        
        // DOM elements initialized successfully
        
        // Admin password
        this.adminPassword = 'CT5Pride2024!';
        
        this.checkAuthentication();
        this.initializeDashboard();
        this.bindEvents();
        this.loadRoles();
        this.loadEvents();
        this.loadApplications();
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

        // Tab switching
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });

        // Events management
        const addNewEventBtn = document.getElementById('addNewEventBtn');
        if (addNewEventBtn) {
            addNewEventBtn.addEventListener('click', () => {
                this.showEventForm();
            });
        }

        const refreshEventsBtn = document.getElementById('refreshEventsBtn');
        if (refreshEventsBtn) {
            refreshEventsBtn.addEventListener('click', () => {
                this.loadEvents();
            });
        }

        // Event form
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveEvent();
            });
        }

        const closeEventFormBtn = document.getElementById('closeEventFormBtn');
        if (closeEventFormBtn) {
            closeEventFormBtn.addEventListener('click', () => {
                this.hideEventForm();
            });
        }

        const clearEventBtn = document.getElementById('clearEventBtn');
        if (clearEventBtn) {
            clearEventBtn.addEventListener('click', () => {
                this.clearEventForm();
            });
        }

        // Event source selection
        const eventSource = document.getElementById('eventSource');
        if (eventSource) {
            eventSource.addEventListener('change', () => {
                this.handleEventSourceChange();
            });
        }

        const fetchEventBtn = document.getElementById('fetchEventBtn');
        if (fetchEventBtn) {
            fetchEventBtn.addEventListener('click', () => {
                this.fetchEventDetails();
            });
        }

        // Applications management
        const refreshApplicationsBtn = document.getElementById('refreshApplicationsBtn');
        if (refreshApplicationsBtn) {
            refreshApplicationsBtn.addEventListener('click', () => {
                this.loadApplications();
            });
        }

        const exportApplicationsBtn = document.getElementById('exportApplicationsBtn');
        if (exportApplicationsBtn) {
            exportApplicationsBtn.addEventListener('click', () => {
                this.exportApplicationsCSV();
            });
        }

        // Applications search and filters
        const applicationSearch = document.getElementById('applicationSearch');
        if (applicationSearch) {
            applicationSearch.addEventListener('input', () => {
                this.filterApplications();
            });
        }

        const applicationStatusFilter = document.getElementById('applicationStatusFilter');
        if (applicationStatusFilter) {
            applicationStatusFilter.addEventListener('change', () => {
                this.filterApplications();
            });
        }

        const applicationRoleFilter = document.getElementById('applicationRoleFilter');
        if (applicationRoleFilter) {
            applicationRoleFilter.addEventListener('change', () => {
                this.filterApplications();
            });
        }

        // Application modal events
        const updateStatusBtn = document.getElementById('updateStatusBtn');
        if (updateStatusBtn) {
            updateStatusBtn.addEventListener('click', () => {
                this.updateApplicationStatus();
            });
        }

        const deleteApplicationBtn = document.getElementById('deleteApplicationBtn');
        if (deleteApplicationBtn) {
            deleteApplicationBtn.addEventListener('click', () => {
                if (this.currentApplicationId) {
                    this.deleteApplication(this.currentApplicationId);
                }
            });
        }

        // Global function for closing application modal
        window.closeApplicationModal = () => {
            this.closeApplicationModal();
        };
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
            
            // All fetches and CRUD now use Supabase-powered endpoints. No config.js or .json fallback remains.
            try {
                const response = await fetch('/api/roles');
                const result = await response.json();
                
                if (result.success && result.roles) {
                    this.roles = result.roles;
                } else {
                    throw new Error('Invalid data format from server API');
                }
            } catch (serverError) {
                console.error('❌ Failed to load roles from server API:', serverError);
                this.showToast('Failed to load roles from server API', 'error');
                this.roles = [];
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
            // All fetches and CRUD now use Supabase-powered endpoints. No config.js or .json fallback remains.
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
        } catch (error) {
            console.error('❌ Create error:', error);
            this.showToast('Error creating role', 'error');
            return false;
        }
    }

    async updateRole(oldId, updatedRole) {
        try {
            // All fetches and CRUD now use Supabase-powered endpoints. No config.js or .json fallback remains.
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
        } catch (error) {
            throw error;
        }
    }

    async deleteRole(roleId) {
        try {
            console.log('🗑️ Attempting to delete role:', roleId);
            
            // All fetches and CRUD now use Supabase-powered endpoints. No config.js or .json fallback remains.
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

    // Tab Management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}Tab`).classList.add('active');

        // Update page title and actions
        if (tabName === 'events') {
            document.querySelector('.admin-hero h1').textContent = '🎉 Events Management Dashboard';
            document.querySelector('.admin-hero p').textContent = 'Manage CT5 Pride events from Eventbrite - Add, Edit, and Remove Events';
        } else {
            document.querySelector('.admin-hero h1').textContent = '🎯 Role Management Dashboard';
            document.querySelector('.admin-hero p').textContent = 'Manage all volunteer roles for CT5 Pride - Create, Edit, Delete, and Update Status';
        }
    }

    // Events Management
    async loadEvents() {
        try {
            this.showEventsLoading();
            console.log('🔄 Loading events...');
            
            try {
                const response = await fetch('/api/eventbrite-events');
                const result = await response.json();
                
                if (result.success && result.events) {
                    this.events = result.events;
                } else {
                    throw new Error('Invalid data format from server API');
                }
            } catch (serverError) {
                console.log('⚠️ Server API not available, loading from local config');
                // Fallback: Load events from local config
                try {
                    const response = await fetch('/events-config.json');
                    const config = await response.json();
                    this.events = config.events || [];
                } catch (configError) {
                    console.error('❌ Failed to load events from config:', configError);
                    this.showToast('Failed to load events from config file', 'error');
                    this.events = [];
                }
            }
            
            this.filteredEvents = [...this.events];
            this.renderEvents();
            this.updateEventStats();
            
        } catch (error) {
            console.error('❌ Error loading events:', error);
            this.showToast('Error loading events', 'error');
            this.events = [];
        } finally {
            this.hideEventsLoading();
        }
    }

    renderEvents() {
        if (!this.eventsTable) {
            console.error('❌ eventsTable element not found!');
            return;
        }
        
        if (this.filteredEvents.length === 0) {
            this.showNoEventsMessage();
            return;
        }

        const tableHTML = `
            <div class="events-table-header">
                <div>Event Information</div>
                <div>Date & Time</div>
                <div>Status</div>
                <div>Actions</div>
            </div>
            ${this.filteredEvents.map(event => this.renderEventRow(event)).join('')}
        `;

        this.eventsTable.innerHTML = tableHTML;
        this.bindEventRowEvents();
    }

    renderEventRow(event) {
        const eventDate = new Date(event.start_date);
        const now = new Date();
        const isUpcoming = eventDate > now;
        const statusClass = isUpcoming ? 'upcoming' : 'past';
        const statusText = isUpcoming ? 'Upcoming' : 'Past';

        return `
            <div class="event-row" data-event-id="${event.id}">
                <div class="event-info">
                    <div class="event-title">${event.title}</div>
                    <div class="event-id">ID: ${event.id}</div>
                </div>
                <div class="event-date">
                    ${eventDate.toLocaleDateString('en-GB', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })}
                    <br>
                    ${eventDate.toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}
                </div>
                <div class="event-status ${statusClass}">
                    ${statusText}
                </div>
                <div class="event-actions">
                    <button class="delete-event-btn" data-event-id="${event.id}">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    }

    bindEventRowEvents() {
        const deleteButtons = document.querySelectorAll('.delete-event-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const eventId = button.dataset.eventId;
                this.deleteEvent(eventId);
            });
        });
    }

    async deleteEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        if (!confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/delete-event/${eventId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                this.showToast(`Event "${event.title}" deleted successfully`, 'success');
                await this.loadEvents();
            } else {
                throw new Error(result.message || 'Failed to delete event');
            }
        } catch (error) {
            console.error('❌ Error deleting event:', error);
            this.showToast('Error deleting event', 'error');
        }
    }

    updateEventStats() {
        const total = this.events.length;
        const now = new Date();
        const upcoming = this.events.filter(e => new Date(e.start_date) > now).length;
        const past = total - upcoming;

        document.getElementById('totalEvents').textContent = total;
        document.getElementById('upcomingEvents').textContent = upcoming;
        document.getElementById('pastEvents').textContent = past;
    }

    showEventsLoading() {
        document.getElementById('loadingEvents').style.display = 'block';
        document.getElementById('eventsTable').style.display = 'none';
        document.getElementById('noEventsMessage').style.display = 'none';
    }

    hideEventsLoading() {
        document.getElementById('loadingEvents').style.display = 'none';
        document.getElementById('eventsTable').style.display = 'block';
    }

    showNoEventsMessage() {
        document.getElementById('noEventsMessage').style.display = 'block';
        document.getElementById('eventsTable').style.display = 'none';
    }

    // Event Form Management
    showEventForm() {
        this.eventFormSection.style.display = 'block';
        this.clearEventForm();
    }

    hideEventForm() {
        this.eventFormSection.style.display = 'none';
        this.clearEventForm();
    }

    clearEventForm() {
        const form = document.getElementById('eventForm');
        if (form) form.reset();
        
        document.getElementById('eventUrlGroup').style.display = 'none';
        document.getElementById('eventIdGroup').style.display = 'none';
        document.getElementById('fetchEventBtn').style.display = 'none';
        document.getElementById('eventPreviewSection').style.display = 'none';
        
        this.currentEventData = null;
    }

    handleEventSourceChange() {
        const source = document.getElementById('eventSource').value;
        const urlGroup = document.getElementById('eventUrlGroup');
        const idGroup = document.getElementById('eventIdGroup');
        const fetchBtn = document.getElementById('fetchEventBtn');

        urlGroup.style.display = 'none';
        idGroup.style.display = 'none';
        fetchBtn.style.display = 'none';

        if (source === 'url') {
            urlGroup.style.display = 'block';
            fetchBtn.style.display = 'inline-block';
        } else if (source === 'id') {
            idGroup.style.display = 'block';
            fetchBtn.style.display = 'inline-block';
        }
    }

    async fetchEventDetails() {
        const source = document.getElementById('eventSource').value;
        let eventId = '';

        if (source === 'url') {
            const url = document.getElementById('eventUrl').value;
            if (!url) {
                this.showToast('Please enter an Eventbrite URL', 'error');
                return;
            }
            eventId = this.extractEventIdFromUrl(url);
            if (!eventId) {
                this.showToast('Invalid Eventbrite URL', 'error');
                return;
            }
        } else if (source === 'id') {
            eventId = document.getElementById('eventId').value;
            if (!eventId) {
                this.showToast('Please enter an Event ID', 'error');
                return;
            }
        }

        try {
            const response = await fetch('/api/fetch-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ eventId })
            });

            const result = await response.json();

            if (result.success) {
                this.currentEventData = result.event;
                this.showEventPreview(result.event);
            } else {
                throw new Error(result.message || 'Failed to fetch event details');
            }
        } catch (error) {
            console.error('❌ Error fetching event details:', error);
            this.showToast('Error fetching event details', 'error');
        }
    }

    extractEventIdFromUrl(url) {
        const match = url.match(/\/e\/[^\/]*-(\d+)/);
        return match ? match[1] : null;
    }

    showEventPreview(event) {
        const previewSection = document.getElementById('eventPreviewSection');
        const preview = document.getElementById('eventPreview');

        const eventDate = new Date(event.start_date);
        const eventEndDate = new Date(event.end_date);

        preview.innerHTML = `
            <h4>${event.title}</h4>
            <div class="event-details">
                <div class="event-detail">
                    <strong>Date:</strong> ${eventDate.toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div class="event-detail">
                    <strong>Time:</strong> ${eventDate.toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })} - ${eventEndDate.toLocaleTimeString('en-GB', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })}
                </div>
                <div class="event-detail">
                    <strong>Location:</strong> ${event.venue?.name || 'TBD'}
                </div>
                <div class="event-detail">
                    <strong>Status:</strong> ${event.status}
                </div>
            </div>
            <div class="event-description">
                ${event.description || 'No description available'}
            </div>
        `;

        previewSection.style.display = 'block';
    }

    async saveEvent() {
        if (!this.currentEventData) {
            this.showToast('Please fetch event details first', 'error');
            return;
        }

        const customSummary = document.getElementById('eventSummary').value;
        const customCta = document.getElementById('eventCta').value;

        const eventData = {
            ...this.currentEventData,
            customSummary: customSummary || null,
            customCta: customCta || null
        };

        try {
            const response = await fetch('/api/add-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(eventData)
            });

            const result = await response.json();

            if (result.success) {
                this.showToast(`Event "${eventData.title}" added successfully`, 'success');
                this.hideEventForm();
                await this.loadEvents();
            } else {
                throw new Error(result.message || 'Failed to add event');
            }
        } catch (error) {
            console.error('❌ Error adding event:', error);
            this.showToast('Error adding event', 'error');
        }
    }

    // Applications Management
    async loadApplications() {
        try {
            this.showApplicationsLoading();
            
            const response = await fetch('/api/applications');
            const result = await response.json();
            
            if (result.success) {
                this.applications = result.applications || [];
                this.filteredApplications = [...this.applications];
                this.renderApplications();
                this.updateApplicationStats();
                this.populateRoleFilter();
            } else {
                this.showToast('Failed to load applications: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error loading applications:', error);
            this.showToast('Failed to load applications', 'error');
        } finally {
            this.hideApplicationsLoading();
        }
    }

    renderApplications() {
        if (!this.applicationsTable) return;

        if (this.filteredApplications.length === 0) {
            this.showNoApplicationsMessage();
            return;
        }

        this.hideNoApplicationsMessage();
        
        const applicationsHTML = this.filteredApplications.map(app => this.renderApplicationRow(app)).join('');
        this.applicationsTable.innerHTML = applicationsHTML;
        this.bindApplicationRowEvents();
    }

    renderApplicationRow(application) {
        const statusClass = this.getApplicationStatusClass(application.status);
        const statusText = this.getApplicationStatusText(application.status);
        const submittedDate = new Date(application.submittedAt).toLocaleDateString();
        
        return `
            <div class="application-row" data-application-id="${application.id}">
                <div class="application-info">
                    <div class="applicant-details">
                        <h4>${application.applicantName}</h4>
                        <p class="applicant-email">${application.applicantEmail}</p>
                        <p class="role-title">${application.roleTitle}</p>
                    </div>
                    <div class="application-meta">
                        <span class="application-status ${statusClass}">${statusText}</span>
                        <span class="application-date">${submittedDate}</span>
                    </div>
                </div>
                <div class="application-actions">
                    <button class="view-application-btn" data-id="${application.id}">👁️ View</button>
                    <button class="delete-application-btn" data-id="${application.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
    }

    bindApplicationRowEvents() {
        // View application buttons
        document.querySelectorAll('.view-application-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const applicationId = btn.getAttribute('data-id');
                this.showApplicationModal(applicationId);
            });
        });

        // Delete application buttons
        document.querySelectorAll('.delete-application-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const applicationId = btn.getAttribute('data-id');
                this.deleteApplication(applicationId);
            });
        });
    }

    async showApplicationModal(applicationId) {
        const application = this.applications.find(app => app.id === applicationId);
        if (!application) return;

        this.currentApplicationId = applicationId;
        
        const modal = document.getElementById('applicationModal');
        const modalTitle = document.getElementById('applicationModalTitle');
        const applicationDetails = document.getElementById('applicationDetails');
        const statusSelect = document.getElementById('applicationStatusSelect');

        modalTitle.textContent = `Application: ${application.applicantName}`;
        statusSelect.value = application.status;

        // Build application details HTML
        const detailsHTML = this.buildApplicationDetailsHTML(application);
        applicationDetails.innerHTML = detailsHTML;

        modal.style.display = 'flex';
    }

    buildApplicationDetailsHTML(application) {
        const submittedDate = new Date(application.submittedAt).toLocaleString();
        const reviewedDate = application.reviewedAt ? new Date(application.reviewedAt).toLocaleString() : 'Not reviewed';

        let cvContent = '';
        if (application.cvType === 'file' && application.cvFile) {
            cvContent = `<p><strong>CV File:</strong> <a href="/api/cv/${application.cvFile}" target="_blank">Download CV</a></p>`;
        } else if (application.cvType === 'text' && application.cvText) {
            cvContent = `
                <p><strong>CV Content:</strong></p>
                <div class="text-content">${application.cvText.replace(/\n/g, '<br>')}</div>
            `;
        }

        let coverLetterContent = '';
        if (application.coverLetterType === 'file' && application.coverLetterFile) {
            coverLetterContent = `<p><strong>Cover Letter File:</strong> <a href="/api/cv/${application.coverLetterFile}" target="_blank">Download Cover Letter</a></p>`;
        } else if (application.coverLetterType === 'text' && application.coverLetterText) {
            coverLetterContent = `
                <p><strong>Cover Letter Content:</strong></p>
                <div class="text-content">${application.coverLetterText.replace(/\n/g, '<br>')}</div>
            `;
        }

        return `
            <div class="application-detail-section">
                <h4>Applicant Information</h4>
                <p><strong>Name:</strong> ${application.applicantName}</p>
                <p><strong>Email:</strong> ${application.applicantEmail}</p>
                <p><strong>Role:</strong> ${application.roleTitle}</p>
                <p><strong>Submitted:</strong> ${submittedDate}</p>
                <p><strong>Status:</strong> ${this.getApplicationStatusText(application.status)}</p>
                ${application.reviewedAt ? `<p><strong>Reviewed:</strong> ${reviewedDate}</p>` : ''}
                ${application.reviewedBy ? `<p><strong>Reviewed By:</strong> ${application.reviewedBy}</p>` : ''}
            </div>
            
            <div class="application-detail-section">
                <h4>CV</h4>
                <p><strong>Type:</strong> ${application.cvType === 'file' ? 'File Upload' : 'Text Input'}</p>
                ${cvContent}
            </div>
            
            <div class="application-detail-section">
                <h4>Cover Letter</h4>
                <p><strong>Type:</strong> ${application.coverLetterType === 'file' ? 'File Upload' : 'Text Input'}</p>
                ${coverLetterContent}
            </div>
        `;
    }

    closeApplicationModal() {
        const modal = document.getElementById('applicationModal');
        modal.style.display = 'none';
        this.currentApplicationId = null;
    }

    async updateApplicationStatus() {
        if (!this.currentApplicationId) return;

        const statusSelect = document.getElementById('applicationStatusSelect');
        const newStatus = statusSelect.value;

        try {
            const response = await fetch(`/api/applications/${this.currentApplicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: newStatus,
                    reviewedBy: 'admin'
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Application status updated successfully!', 'success');
                this.closeApplicationModal();
                this.loadApplications();
            } else {
                this.showToast('Failed to update status: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error updating application status:', error);
            this.showToast('Failed to update application status', 'error');
        }
    }

    async deleteApplication(applicationId) {
        if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/applications/${applicationId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                this.showToast('Application deleted successfully!', 'success');
                this.loadApplications();
            } else {
                this.showToast('Failed to delete application: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Error deleting application:', error);
            this.showToast('Failed to delete application', 'error');
        }
    }

    filterApplications() {
        const searchTerm = document.getElementById('applicationSearch').value.toLowerCase();
        const statusFilter = document.getElementById('applicationStatusFilter').value;
        const roleFilter = document.getElementById('applicationRoleFilter').value;

        this.filteredApplications = this.applications.filter(app => {
            const matchesSearch = !searchTerm || 
                app.applicantName.toLowerCase().includes(searchTerm) ||
                app.applicantEmail.toLowerCase().includes(searchTerm) ||
                app.roleTitle.toLowerCase().includes(searchTerm);
            
            const matchesStatus = !statusFilter || app.status === statusFilter;
            const matchesRole = !roleFilter || app.roleTitle === roleFilter;

            return matchesSearch && matchesStatus && matchesRole;
        });

        this.renderApplications();
    }

    updateApplicationStats() {
        const total = this.applications.length;
        const pending = this.applications.filter(app => app.status === 'pending').length;
        const reviewed = this.applications.filter(app => app.status === 'reviewed').length;
        const accepted = this.applications.filter(app => app.status === 'accepted').length;

        document.getElementById('totalApplications').textContent = total;
        document.getElementById('pendingApplications').textContent = pending;
        document.getElementById('reviewedApplications').textContent = reviewed;
        document.getElementById('acceptedApplications').textContent = accepted;
    }

    populateRoleFilter() {
        const roleFilter = document.getElementById('applicationRoleFilter');
        if (!roleFilter) return;

        const roles = [...new Set(this.applications.map(app => app.roleTitle))];
        const currentValue = roleFilter.value;

        roleFilter.innerHTML = '<option value="">All Roles</option>';
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role;
            option.textContent = role;
            roleFilter.appendChild(option);
        });

        roleFilter.value = currentValue;
    }

    exportApplicationsCSV() {
        const headers = ['Name', 'Email', 'Role', 'Status', 'Submitted', 'CV Type', 'Cover Letter Type'];
        const csvContent = [
            headers.join(','),
            ...this.filteredApplications.map(app => [
                `"${app.applicantName}"`,
                `"${app.applicantEmail}"`,
                `"${app.roleTitle}"`,
                `"${app.status}"`,
                `"${new Date(app.submittedAt).toLocaleDateString()}"`,
                `"${app.cvType}"`,
                `"${app.coverLetterType}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Applications exported successfully!', 'success');
    }

    showApplicationsLoading() {
        const loading = document.getElementById('loadingApplications');
        if (loading) loading.style.display = 'flex';
    }

    hideApplicationsLoading() {
        const loading = document.getElementById('loadingApplications');
        if (loading) loading.style.display = 'none';
    }

    showNoApplicationsMessage() {
        const message = document.getElementById('noApplicationsMessage');
        if (message) message.style.display = 'block';
    }

    hideNoApplicationsMessage() {
        const message = document.getElementById('noApplicationsMessage');
        if (message) message.style.display = 'none';
    }

    getApplicationStatusClass(status) {
        const statusClasses = {
            'pending': 'status-pending',
            'reviewed': 'status-reviewed',
            'accepted': 'status-accepted',
            'rejected': 'status-rejected'
        };
        return statusClasses[status] || 'status-pending';
    }

    getApplicationStatusText(status) {
        const statusTexts = {
            'pending': 'Pending Review',
            'reviewed': 'Reviewed',
            'accepted': 'Accepted',
            'rejected': 'Rejected'
        };
        return statusTexts[status] || 'Pending Review';
    }
}

// Supabase Auth session check
const SUPABASE_URL = 'https://rmhnrpwbgxyslfwttwzr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtaG5ycHdiZ3h5c2xmd3R0d3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTQyMDcsImV4cCI6MjA2ODY5MDIwN30.yNlkzFMfvUCoN6IwEY4LgL6_ihdR_ux22oqvDnkWTxg';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
        window.location.href = 'admin-login.html';
    }
});

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'admin-login.html';
    });
}

// Initialize the admin system when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminRoleManager();
}); 