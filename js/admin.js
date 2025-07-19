// Admin Role Management System - GitHub Actions Integration
class AdminRoleManager {
    constructor() {
        this.form = document.getElementById('roleForm');
        this.previewContainer = document.getElementById('rolePreview');
        this.successMessage = document.getElementById('successMessage');
        
        this.initializeForm();
        this.bindEvents();
    }

    initializeForm() {
        // Set default values
        document.getElementById('roleId').value = this.generateRoleId();
        document.getElementById('roleStatus').value = 'draft';
        document.getElementById('roleIcon').value = 'volunteers';
        
        // Auto-generate ID when title changes
        document.getElementById('roleTitle').addEventListener('input', (e) => {
            if (!document.getElementById('roleId').value.startsWith('custom-')) {
                document.getElementById('roleId').value = this.generateRoleId();
            }
        });
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRole();
        });

        // Preview button
        document.getElementById('previewBtn').addEventListener('click', () => {
            this.generatePreview();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearForm();
        });

        // Add another role button
        document.getElementById('addAnotherBtn').addEventListener('click', () => {
            this.clearForm();
            this.hideSuccessMessage();
        });
    }

    generateRoleId() {
        const title = document.getElementById('roleTitle').value || 'new-role';
        return 'custom-' + title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }

    generatePreview() {
        const roleData = this.getFormData();
        if (!this.validateForm(roleData)) return;

        const preview = this.createRolePreview(roleData);
        this.previewContainer.innerHTML = preview;
        this.previewContainer.style.display = 'block';
        
        // Scroll to preview
        this.previewContainer.scrollIntoView({ behavior: 'smooth' });
    }

    createRolePreview(role) {
        const roleIcons = {
            "parade": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
            "social-media": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.22.42-1.42 1.01L3 11v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8l-2.08-5.99zM9 16H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>`,
            "outreach": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.84 1.84 0 0 0 18.2 7c-.8 0-1.54.5-1.85 1.26l-1.92 5.76c-.15.45.15.98.64.98.18 0 .35-.06.49-.16l2.44-1.68V22h2zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H9.5l-1.32-3.96c-.26-.79-.98-1.29-1.85-1.29C5.76 9.75 5.2 10.42 5.2 11.2c0 .27.08.53.22.74L7 16h1v6h2z"/></svg>`,
            "volunteers": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3 6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM8 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>`,
            "fundraising": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>`,
            "youth": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
        };

        return `
            <div class="preview-card">
                <h3>📋 Role Preview</h3>
                <div class="simple-role-card" style="cursor: default;">
                    <div class="role-header">
                        <div class="role-icon-simple">${roleIcons[role.icon] || roleIcons['volunteers']}</div>
                        <div class="role-info">
                            <h3>${role.title}</h3>
                            <span class="role-department-simple">${role.department}</span>
                            ${role.status === 'draft' ? '<span class="draft-badge">Preview</span>' : ''}
                        </div>
                        <div class="role-actions-simple">
                            ${role.status === 'open' ? `<a href="apply.html" class="button">Apply Now</a>` : ''}
                        </div>
                    </div>
                    <p class="role-summary">${role.summary}</p>
                </div>
                
                <div class="preview-details">
                    <h4>Role Details:</h4>
                    <ul>
                        <li><strong>ID:</strong> ${role.id}</li>
                        <li><strong>Category:</strong> ${role.category}</li>
                        <li><strong>Status:</strong> ${role.status}</li>
                        <li><strong>Location:</strong> ${role.location}</li>
                        <li><strong>Reporting Line:</strong> ${role.reportingLine}</li>
                        <li><strong>Time Commitment:</strong> ${role.timeCommitment}</li>
                    </ul>
                    
                    <h4>Essential Criteria (${role.essentialCriteria.length} items):</h4>
                    <ul>
                        ${role.essentialCriteria.map(criteria => `<li>${criteria}</li>`).join('')}
                    </ul>
                    
                    <h4>Desirable Criteria (${role.desirableCriteria.length} items):</h4>
                    <ul>
                        ${role.desirableCriteria.map(criteria => `<li>${criteria}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    getFormData() {
        return {
            id: document.getElementById('roleId').value,
            title: document.getElementById('roleTitle').value,
            category: document.getElementById('roleCategory').value,
            department: document.getElementById('roleDepartment').value,
            status: document.getElementById('roleStatus').value,
            icon: document.getElementById('roleIcon').value,
            summary: document.getElementById('roleSummary').value,
            location: document.getElementById('roleLocation').value,
            reportingLine: document.getElementById('roleReportingLine').value,
            timeCommitment: document.getElementById('roleTimeCommitment').value,
            description: document.getElementById('roleDescription').value,
            essentialCriteria: this.getCriteriaArray('roleEssentialCriteria'),
            desirableCriteria: this.getCriteriaArray('roleDesirableCriteria')
        };
    }

    getCriteriaArray(fieldId) {
        const textarea = document.getElementById(fieldId);
        return textarea.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    validateForm(data) {
        const requiredFields = ['title', 'department', 'summary', 'location', 'reportingLine', 'timeCommitment', 'description'];
        const missingFields = requiredFields.filter(field => !data[field] || data[field].trim() === '');
        
        if (missingFields.length > 0) {
            alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
            return false;
        }

        if (data.essentialCriteria.length === 0) {
            alert('Please add at least one essential criteria.');
            return false;
        }

        if (data.desirableCriteria.length === 0) {
            alert('Please add at least one desirable criteria.');
            return false;
        }

        return true;
    }

    async saveRole() {
        const roleData = this.getFormData();
        if (!this.validateForm(roleData)) return;

        // Show loading state
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '⏳ Submitting...';
        submitBtn.disabled = true;

        try {
            // Send to GitHub Actions via repository dispatch
            const response = await fetch('https://api.github.com/repos/CT5-Pride-C-I-C/CT5-Pride/dispatches', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.getGitHubToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                body: JSON.stringify({
                    event_type: 'add-role',
                    client_payload: {
                        roleData: roleData
                    }
                })
            });

            if (response.ok) {
                this.showSuccessMessage(`
                    <h3>✅ Role Submitted Successfully!</h3>
                    <p>Your new role has been sent to GitHub and will be processed automatically.</p>
                    <div class="processing-info">
                        <h4>What's happening now:</h4>
                        <ol>
                            <li>🔄 GitHub Actions is processing your role</li>
                            <li>📝 Updating js/main.js with the new role</li>
                            <li>💾 Committing and pushing changes</li>
                            <li>🚀 Netlify will automatically deploy the updates</li>
                        </ol>
                        <p><strong>⏱️ Your website will update in 1-2 minutes!</strong></p>
                        <p>You can check the progress in your GitHub repository's Actions tab.</p>
                    </div>
                `);
                this.clearForm();
            } else {
                const errorData = await response.json();
                throw new Error(`GitHub API Error: ${errorData.message || response.statusText}`);
            }
        } catch (error) {
            console.error('Error submitting role:', error);
            alert(`Error submitting role: ${error.message}\n\nPlease check your GitHub token and repository settings.`);
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    getGitHubToken() {
        // Get token from environment variable or prompt user
        // For security, the token should be stored in Netlify environment variables
        const token = prompt('Please enter your GitHub Personal Access Token (admin-roles-token):');
        if (!token) {
            throw new Error('GitHub token is required');
        }
        return token;
    }

    clearForm() {
        this.form.reset();
        document.getElementById('roleId').value = this.generateRoleId();
        document.getElementById('roleStatus').value = 'draft';
        document.getElementById('roleIcon').value = 'volunteers';
        this.previewContainer.style.display = 'none';
    }

    showSuccessMessage(content) {
        this.successMessage.innerHTML = content;
        this.successMessage.style.display = 'block';
        this.successMessage.scrollIntoView({ behavior: 'smooth' });
        
        // Show "Add Another" button
        document.querySelector('.add-another-section').style.display = 'block';
    }

    hideSuccessMessage() {
        this.successMessage.style.display = 'none';
        document.querySelector('.add-another-section').style.display = 'none';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AdminRoleManager();
}); 