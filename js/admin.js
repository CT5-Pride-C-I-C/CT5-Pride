// Admin password
const ADMIN_PASSWORD = 'ct5admin2025';

// Admin functionality
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginScreen = document.getElementById('loginScreen');
    const adminInterface = document.getElementById('adminInterface');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const logoutButton = document.getElementById('logoutButton');
    const roleForm = document.getElementById('roleForm');
    const roleFormSection = document.getElementById('roleFormSection');
    const rolesList = document.getElementById('rolesList');
    const exportButton = document.getElementById('exportButton');
    const addNewButton = document.getElementById('addNewButton');
    const cancelEdit = document.getElementById('cancelEdit');
    const filterCategory = document.getElementById('filterCategory');
    const filterStatus = document.getElementById('filterStatus');
    const notificationToast = document.getElementById('notificationToast');
    const notificationMessage = document.getElementById('notificationMessage');

    // State management
    let roles = [];
    let filters = {
        category: '',
        status: ''
    };

    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminInterface();
    }

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('password').value;

        if (password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminInterface();
            loginError.style.display = 'none';
        } else {
            loginError.style.display = 'block';
            loginForm.reset();
        }
    });

    // Logout functionality
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('adminLoggedIn');
        location.reload();
    });

    // Show admin interface
    function showAdminInterface() {
        loginScreen.style.display = 'none';
        adminInterface.style.display = 'block';
        loadRoles();
    }

    // Show notification
    function showNotification(message, isError = false) {
        notificationMessage.textContent = message;
        notificationToast.className = `notification-toast ${isError ? 'error' : 'success'}`;
        notificationToast.style.display = 'block';
        setTimeout(() => {
            notificationToast.style.display = 'none';
        }, 3000);
    }

    // Load roles from roles.json
    async function loadRoles() {
        try {
            const response = await fetch('roles.json');
            roles = await response.json();
            const savedRoles = localStorage.getItem('roles');
            if (savedRoles) {
                roles = JSON.parse(savedRoles);
            }
            applyFiltersAndDisplay();
        } catch (error) {
            console.error('Error loading roles:', error);
            showNotification('Error loading roles. Please try again.', true);
        }
    }

    // Filter and display roles
    function applyFiltersAndDisplay() {
        let filteredRoles = roles.filter(role => {
            const matchesCategory = !filters.category || role.category === filters.category;
            const matchesStatus = !filters.status || role.status === filters.status;
            return matchesCategory && matchesStatus;
        });

        displayRoles(filteredRoles);
    }

    // Display roles in the list
    function displayRoles(rolesToDisplay) {
        if (rolesToDisplay.length === 0) {
            rolesList.innerHTML = '<p class="no-roles">No roles found matching the current filters.</p>';
            return;
        }

        rolesList.innerHTML = rolesToDisplay.map((role, index) => `
            <div class="role-item">
                <div class="role-header">
                    <h3>${role.title}</h3>
                    <span class="role-status ${role.status}">${role.status}</span>
                </div>
                <p class="role-summary">${role.summary}</p>
                <div class="role-details">
                    <p><strong>Category:</strong> ${role.category}</p>
                    ${role.applyLink ? `<p><strong>Apply Link:</strong> <a href="${role.applyLink}" target="_blank">${role.applyLink}</a></p>` : ''}
                </div>
                <div class="role-actions">
                    <button onclick="editRole(${index})" class="button secondary">Edit</button>
                    <button onclick="deleteRole(${index})" class="button secondary">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Add/Edit role form handling
    roleForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roleIndex = document.getElementById('roleIndex').value;
        const roleData = {
            title: document.getElementById('roleTitle').value,
            category: document.getElementById('roleCategory').value,
            status: document.getElementById('roleStatus').value,
            summary: document.getElementById('roleSummary').value,
            applyLink: document.getElementById('roleApplyLink').value || ''
        };

        if (roleIndex === '') {
            // Add new role
            roles.push(roleData);
            showNotification('Role added successfully!');
        } else {
            // Update existing role
            roles[roleIndex] = roleData;
            showNotification('Role updated successfully!');
        }

        saveRoles();
        applyFiltersAndDisplay();
        resetForm();
    });

    // Edit role
    window.editRole = function(index) {
        const role = roles[index];
        document.getElementById('roleIndex').value = index;
        document.getElementById('roleTitle').value = role.title;
        document.getElementById('roleCategory').value = role.category;
        document.getElementById('roleStatus').value = role.status;
        document.getElementById('roleSummary').value = role.summary;
        document.getElementById('roleApplyLink').value = role.applyLink || '';
        
        document.getElementById('formTitle').textContent = 'Edit Role';
        roleFormSection.style.display = 'block';
        roleFormSection.scrollIntoView({ behavior: 'smooth' });
    };

    // Delete role
    window.deleteRole = function(index) {
        if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
            roles.splice(index, 1);
            saveRoles();
            applyFiltersAndDisplay();
            showNotification('Role deleted successfully!');
        }
    };

    // Save roles
    function saveRoles() {
        localStorage.setItem('roles', JSON.stringify(roles));
    }

    // Reset form
    function resetForm() {
        roleForm.reset();
        document.getElementById('roleIndex').value = '';
        document.getElementById('formTitle').textContent = 'Add New Role';
        roleFormSection.style.display = 'none';
    }

    // Add New button click
    addNewButton.addEventListener('click', () => {
        resetForm();
        roleFormSection.style.display = 'block';
        roleFormSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Cancel button click
    cancelEdit.addEventListener('click', resetForm);

    // Filter change handlers
    filterCategory.addEventListener('change', () => {
        filters.category = filterCategory.value;
        applyFiltersAndDisplay();
    });

    filterStatus.addEventListener('change', () => {
        filters.status = filterStatus.value;
        applyFiltersAndDisplay();
    });

    // Export functionality
    exportButton.addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(roles, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'roles.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('Roles file downloaded successfully!');
    });
}); 