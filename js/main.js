// Accessibility Manager
class AccessibilityManager {
    constructor() {
        this.settings = {
            highContrast: false,
            dyslexiaFriendly: false,
            reduceMotion: false,
            textSize: 'normal'
        };
        
        this.init();
    }
    
    init() {
        this.loadSettings();
        this.applySettings();
        this.bindEvents();
    }
    
    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('ct5-pride-accessibility');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('ct5-pride-accessibility', JSON.stringify(this.settings));
    }
    
    // Apply all accessibility settings to the page
    applySettings() {
        const body = document.body;
        
        // High Contrast Mode
        if (this.settings.highContrast) {
            body.classList.add('high-contrast');
        } else {
            body.classList.remove('high-contrast');
        }
        
        // Dyslexia-Friendly Font
        if (this.settings.dyslexiaFriendly) {
            body.classList.add('dyslexia-friendly');
        } else {
            body.classList.remove('dyslexia-friendly');
        }
        
        // Reduce Motion
        if (this.settings.reduceMotion) {
            body.classList.add('reduce-motion');
        } else {
            body.classList.remove('reduce-motion');
        }
        
        // Text Size
        body.classList.remove('text-small', 'text-large', 'text-extra-large');
        if (this.settings.textSize !== 'normal') {
            body.classList.add(`text-${this.settings.textSize}`);
        }
        
        this.updateUI();
    }
    
    // Update UI to reflect current settings
    updateUI() {
        // Update toggle switches
        const toggles = {
            'high-contrast-toggle': this.settings.highContrast,
            'dyslexia-toggle': this.settings.dyslexiaFriendly,
            'reduce-motion-toggle': this.settings.reduceMotion
        };
        
        Object.entries(toggles).forEach(([id, active]) => {
            const toggle = document.getElementById(id);
            if (toggle) {
                toggle.classList.toggle('active', active);
                toggle.setAttribute('aria-checked', active.toString());
            }
        });
        
        // Update text size buttons
        document.querySelectorAll('.text-size-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.size === this.settings.textSize);
        });
    }
    
    // Bind event listeners
    bindEvents() {
        // Accessibility panel toggle
        const accessibilityToggle = document.querySelector('.accessibility-toggle');
        const accessibilityMenu = document.querySelector('.accessibility-menu');
        
        if (accessibilityToggle && accessibilityMenu) {
            accessibilityToggle.addEventListener('click', () => {
                const isOpen = accessibilityMenu.classList.contains('active');
                accessibilityMenu.classList.toggle('active');
                accessibilityToggle.setAttribute('aria-expanded', (!isOpen).toString());
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.accessibility-panel')) {
                    accessibilityMenu.classList.remove('active');
                    accessibilityToggle.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Close menu on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && accessibilityMenu.classList.contains('active')) {
                    accessibilityMenu.classList.remove('active');
                    accessibilityToggle.setAttribute('aria-expanded', 'false');
                    accessibilityToggle.focus();
                }
            });
        }
        
        // Toggle switches
        this.bindToggleSwitch('high-contrast-toggle', 'highContrast');
        this.bindToggleSwitch('dyslexia-toggle', 'dyslexiaFriendly');
        this.bindToggleSwitch('reduce-motion-toggle', 'reduceMotion');
        
        // Text size buttons
        document.querySelectorAll('.text-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.settings.textSize = btn.dataset.size;
                this.saveSettings();
                this.applySettings();
            });
        });
    }
    
    // Bind toggle switch functionality
    bindToggleSwitch(id, setting) {
        const toggle = document.getElementById(id);
        if (!toggle) return;
        
        const handleToggle = () => {
            this.settings[setting] = !this.settings[setting];
            this.saveSettings();
            this.applySettings();
        };
        
        toggle.addEventListener('click', handleToggle);
        toggle.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                handleToggle();
            }
        });
    }
}

// Header Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Accessibility Manager
    const accessibilityManager = new AccessibilityManager();
    
    // Elements
    const header = document.querySelector('header');
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');
    
    // Mobile Menu Toggle
    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && 
                !e.target.closest('nav') && 
                !e.target.closest('.nav-toggle')) {
                nav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                nav.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = 'auto';
                navToggle.focus();
            }
        });
    }

    // Mobile Dropdown Functionality
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const dropdownLink = dropdown.querySelector('a');
        
        // On mobile, make dropdown links toggle the submenu
        dropdownLink.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
        
        // Keyboard navigation for dropdowns
        dropdownLink.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    dropdown.classList.toggle('active');
                }
            }
        });
    });

    // Scroll Effect
    let lastScroll = 0;
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
    
    // Enhanced Button Hover Effects (respects reduced motion)
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!document.body.classList.contains('reduce-motion')) {
                button.style.transform = 'translateY(-2px)';
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (!document.body.classList.contains('reduce-motion')) {
                button.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Pride flag icon interactions
    const prideFlags = document.querySelectorAll('.pride-flag-icon');
    prideFlags.forEach(flag => {
        flag.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Could add flag information modal here
                console.log(`Activated ${flag.getAttribute('aria-label')}`);
            }
        });
    });
    
    // Focus management for skip link
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    
    if (skipLink && mainContent) {
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            mainContent.focus();
            mainContent.scrollIntoView();
        });
    }
    
    // Smooth scrolling for internal links (respects reduced motion)
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                e.preventDefault();
                if (document.body.classList.contains('reduce-motion')) {
                    target.scrollIntoView();
                } else {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
                target.focus();
            }
        });
    });
});

// Role data is now imported from config.js

// Role icons are now imported from config.js

// Role Detail Modal Functions
function initializeRoleDetailModal() {
    const modal = document.getElementById('roleDetailModal');

    // Close modal function
    function closeRoleDetailModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Add close handlers
    document.querySelectorAll('#roleDetailModal .modal-close').forEach(button => {
        button.addEventListener('click', closeRoleDetailModal);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeRoleDetailModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeRoleDetailModal();
        }
    });
}

async function openRoleDetailModal(roleId) {
    try {
        // All role loading now uses /api/roles (Supabase-powered endpoint). No config.js import remains.
        const response = await fetch(`/api/roles/${roleId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const role = await response.json();

    const modal = document.getElementById('roleDetailModal');
    
    // Populate modal content
    document.getElementById('roleDetailTitle').textContent = role.title;
    document.getElementById('roleDetailDepartment').textContent = role.department;
    document.getElementById('roleDetailLocation').textContent = role.location;
    document.getElementById('roleDetailReportingLine').textContent = role.reportingLine;
    document.getElementById('roleDetailTimeCommitment').textContent = role.timeCommitment;
    document.getElementById('roleDetailDescription').innerHTML = role.description;

    // Populate essential criteria
    const essentialList = document.getElementById('roleEssentialCriteria');
    essentialList.innerHTML = role.essentialCriteria.map(criteria => 
        `<li>${criteria}</li>`
    ).join('');

    // Populate desirable criteria
    const desirableList = document.getElementById('roleDesirableCriteria');
    desirableList.innerHTML = role.desirableCriteria.map(criteria => 
        `<li>${criteria}</li>`
    ).join('');

    // Add role icon
    const iconContainer = modal.querySelector('.role-icon');
    iconContainer.innerHTML = role.icon; // Assuming icon is a string like 'lgbtq' or 'volunteers'

    // Update apply button state - now just shows/hides the link
    const applyButton = modal.querySelector('.role-actions a');
    if (role.status === 'open') {
        applyButton.style.display = 'inline-block';
    } else {
        applyButton.style.display = 'none';
    }

            // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus management
        modal.focus();
    } catch (error) {
        console.error('Error opening role detail modal:', error);
    }
}

// Enhanced Volunteer Role Board - Simplified Layout
async function loadRoles() {
    try {
        // All role loading now uses /api/roles (Supabase-powered endpoint). No config.js import remains.
        const response = await fetch('/api/roles');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const roles = await response.json();
        
        // Check if we should show draft roles
        const showDraft = new URLSearchParams(window.location.search).get('preview') === 'true';
        
        // Get role board container
        const roleBoard = document.querySelector('.role-board');
        if (!roleBoard) return;

        // Filter roles - only show open roles and draft roles if in preview mode
        const visibleRoles = roles.filter(role => {
            if (role.status === 'open') return true;
            if (role.status === 'draft' && showDraft) return true;
            return false; // Hide closed roles completely
        });

        // Create simplified single-column layout
        roleBoard.className = 'role-board-simple';
        
        if (visibleRoles.length > 0) {
            // Create role cards asynchronously
            const roleCards = await Promise.all(visibleRoles.map(role => createSimpleRoleCard(role)));
            roleBoard.innerHTML = roleCards.join('');
        } else {
            roleBoard.innerHTML = '<div class="no-roles-message"><h3>🌈 No Open Positions Currently</h3><p>We\'re not actively recruiting for new volunteer positions right now, but we\'d still love to hear from you! <a href="contact.html">Get in touch</a> to learn about future opportunities.</p></div>';
        }

        // Add click handlers for role cards
        document.querySelectorAll('[data-role-id]').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const roleId = card.getAttribute('data-role-id');
                openRoleDetailModal(roleId);
            });
            
            // Keyboard accessibility
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const roleId = card.getAttribute('data-role-id');
                    openRoleDetailModal(roleId);
                }
            });
        });

    } catch (error) {
        console.error('Error loading roles:', error);
        const roleBoard = document.querySelector('.role-board');
        if (roleBoard) {
            roleBoard.innerHTML = `
                <div class="text-center">
                    <p>Sorry, we couldn't load the volunteer opportunities. Please try refreshing the page or contact us directly.</p>
                </div>
            `;
        }
    }
}

async function createSimpleRoleCard(role) {
    try {
        // All role loading now uses /api/roles (Supabase-powered endpoint). No config.js import remains.
        const response = await fetch(`/api/roles/${role.id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const roleData = await response.json();

        const isOpen = roleData.status === 'open';
        
        return `
            <div class="simple-role-card ${!isOpen ? 'draft' : ''}" data-role-id="${role.id}" style="cursor: pointer;" tabindex="0" role="button" aria-label="View details for ${role.title}">
                <div class="role-header">
                    <div class="role-icon-simple">${roleData.icon}</div>
                    <div class="role-info">
                        <h3>${roleData.title}</h3>
                        <span class="role-department-simple">${roleData.department}</span>
                        ${!isOpen ? '<span class="draft-badge">Preview</span>' : ''}
                    </div>
                    <div class="role-actions-simple">
                        ${isOpen ? `<a href="apply.html" class="button" onclick="event.stopPropagation()" aria-label="Apply for ${roleData.title}">Apply Now</a>` : ''}
                    </div>
                </div>
                <p class="role-summary">${roleData.summary}</p>
            </div>
        `;
    } catch (error) {
        console.error('Error creating role card:', error);
        return '';
    }
}

// Initialize all functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize role detail modal
    if (document.getElementById('roleDetailModal')) {
        initializeRoleDetailModal();
    }
    
    // Load roles if we're on the volunteer page (but not if we have the dynamic script)
    if (window.location.pathname.includes('volunteer') && !document.querySelector('script[type="module"]')) {
        loadRoles();
    }
}); 