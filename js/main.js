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

// Enhanced Volunteer Role Data with Full Job Descriptions
const rolesData = [
    {
        "id": "parade-coordinator",
        "title": "Parade Coordinator",
        "category": "Year-Round",
        "department": "Events",
        "status": "open",
        "summary": "Help plan and coordinate our annual pride parade. Looking for someone with event planning experience and great organizational skills.",
        "description": `
            <p>As our Parade Coordinator, you'll play a vital role in organizing CT5 Pride's flagship annual event. This is a hands-on role that involves working with local authorities, coordinating with participants, and ensuring our parade is both spectacular and safe.</p>
            
            <p>You'll be responsible for liaison with Canterbury City Council, Kent Police, and other stakeholders to secure necessary permits and ensure compliance with safety regulations. You'll also coordinate with local LGBTQIA+ groups, allies, and supporters to encourage participation.</p>
            
            <p>This role offers the opportunity to make a significant impact on our community's most visible celebration of LGBTQIA+ pride and visibility.</p>
        `,
        "essentialCriteria": [
            "Previous event planning or coordination experience",
            "Strong organizational and project management skills",
            "Excellent communication and liaison abilities",
            "Ability to work under pressure and meet deadlines",
            "Commitment to LGBTQIA+ rights and inclusion",
            "Available for weekend and evening work during peak periods"
        ],
        "desirableCriteria": [
            "Experience with street events or parades",
            "Knowledge of local council processes and regulations",
            "Experience working with emergency services",
            "Event management qualifications",
            "Connections within the local LGBTQIA+ community"
        ],
        "icon": "parade"
    },
    {
        "id": "social-media-manager",
        "title": "Social Media Manager",
        "category": "Year-Round",
        "department": "Marketing",
        "status": "open",
        "summary": "Create engaging content and manage our social media presence across Instagram and Facebook to build our community online.",
        "description": `
            <p>Join our team as Social Media Manager and help amplify CT5 Pride's voice across digital platforms. You'll be responsible for creating engaging, authentic content that celebrates our community and promotes our events and initiatives.</p>
            
            <p>Working closely with our Communications team, you'll develop and implement our social media strategy, ensuring consistent messaging that reflects our values of inclusion, celebration, and community support.</p>
            
            <p>This role offers creative freedom to showcase the vibrancy of our community while building meaningful connections with LGBTQIA+ individuals and allies across the CT5 area.</p>
        `,
        "essentialCriteria": [
            "Experience managing social media for organizations or brands",
            "Strong writing skills and visual content creation abilities",
            "Understanding of social media best practices and analytics",
            "Commitment to LGBTQIA+ representation and inclusion",
            "Ability to work independently and meet deadlines",
            "Available for 5-10 hours per week, with flexibility around events"
        ],
        "desirableCriteria": [
            "Experience with Instagram, Facebook, and TikTok",
            "Graphic design skills (Canva, Photoshop, etc.)",
            "Photography or video editing experience",
            "Previous work with LGBTQIA+ organizations or causes",
            "Understanding of community engagement strategies"
        ],
        "icon": "social-media"
    },
    {
        "id": "community-outreach-lead",
        "title": "Community Outreach Lead",
        "category": "Year-Round",
        "department": "Outreach",
        "status": "closed",
        "summary": "Build relationships with local LGBTQIA+ organizations and allies in the CT5 area to strengthen our community network.",
        "description": `
            <p>As Community Outreach Lead, you'll be the bridge between CT5 Pride and the wider LGBTQIA+ community. This role involves building meaningful partnerships with local organizations, businesses, and community groups.</p>
            
            <p>You'll represent CT5 Pride at community events, facilitate collaborative projects, and help identify opportunities for mutual support and advocacy within our local area.</p>
        `,
        "essentialCriteria": [
            "Strong interpersonal and networking skills",
            "Experience in community engagement or partnership building",
            "Commitment to LGBTQIA+ advocacy and inclusion"
        ],
        "desirableCriteria": [
            "Existing connections within the local LGBTQIA+ community",
            "Experience with non-profit organizations"
        ],
        "icon": "outreach"
    },
    {
        "id": "volunteer-coordinator",
        "title": "Volunteer Coordinator",
        "category": "Year-Round",
        "department": "Operations",
        "status": "closed",
        "summary": "Manage our amazing volunteer team and help match people with the right opportunities to maximize their impact.",
        "description": `
            <p>Our Volunteer Coordinator ensures that every volunteer has a meaningful and rewarding experience with CT5 Pride. You'll be responsible for recruitment, onboarding, and ongoing support of our volunteer team.</p>
            
            <p>This role involves matching volunteers with opportunities that suit their skills and interests, providing training and support, and maintaining regular communication to ensure engagement and satisfaction.</p>
        `,
        "essentialCriteria": [
            "Experience in volunteer management or human resources",
            "Strong organizational and people management skills",
            "Excellent communication abilities"
        ],
        "desirableCriteria": [
            "Experience with volunteer management systems",
            "Background in training and development"
        ],
        "icon": "volunteers"
    },
    {
        "id": "fundraising-director",
        "title": "Fundraising Director",
        "category": "Year-Round",
        "department": "Fundraising",
        "status": "draft",
        "summary": "Lead our fundraising efforts and develop relationships with sponsors and donors to support our mission.",
        "description": `
            <p>As Fundraising Director, you'll develop and implement comprehensive fundraising strategies to ensure CT5 Pride has the resources needed to serve our community effectively.</p>
            
            <p>This strategic role involves grant writing, corporate partnership development, individual donor cultivation, and event-based fundraising initiatives.</p>
        `,
        "essentialCriteria": [
            "Proven experience in fundraising or development",
            "Grant writing experience",
            "Strong relationship building skills"
        ],
        "desirableCriteria": [
            "Experience with LGBTQIA+ organizations",
            "Corporate partnership experience"
        ],
        "icon": "fundraising"
    },
    {
        "id": "youth-engagement-officer",
        "title": "Youth Engagement Officer",
        "category": "Year-Round",
        "department": "Programs",
        "status": "draft",
        "summary": "Create and coordinate programs specifically for LGBTQIA+ youth in our community, providing support and safe spaces.",
        "description": `
            <p>Our Youth Engagement Officer will develop and deliver programs specifically designed to support LGBTQIA+ young people in the CT5 area. This includes creating safe spaces, educational workshops, and social activities.</p>
            
            <p>Working with schools, youth services, and families, you'll help ensure that young LGBTQIA+ people in our community have access to support, resources, and positive role models.</p>
        `,
        "essentialCriteria": [
            "Experience working with young people",
            "Understanding of LGBTQIA+ youth issues",
            "Enhanced DBS check (or willingness to obtain)",
            "Strong safeguarding awareness"
        ],
        "desirableCriteria": [
            "Youth work qualifications",
            "Experience with LGBTQIA+ support services",
            "Mental health first aid training"
        ],
        "icon": "youth"
    }
];

// SVG Icons for different role types
const roleIcons = {
    "parade": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    "social-media": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.22.42-1.42 1.01L3 11v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8l-2.08-5.99zM9 16H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>`,
    "outreach": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.84 1.84 0 0 0 18.2 7c-.8 0-1.54.5-1.85 1.26l-1.92 5.76c-.15.45.15.98.64.98.18 0 .35-.06.49-.16l2.44-1.68V22h2zm-7.5-10.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.5 16v-7H9.5l-1.32-3.96c-.26-.79-.98-1.29-1.85-1.29C5.76 9.75 5.2 10.42 5.2 11.2c0 .27.08.53.22.74L7 16h1v6h2z"/></svg>`,
    "volunteers": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3 6.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5zM8 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm8 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-8 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg>`,
    "fundraising": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>`,
    "youth": `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
};

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

function openRoleDetailModal(roleId) {
    const role = rolesData.find(r => r.id === roleId);
    if (!role) return;

    const modal = document.getElementById('roleDetailModal');
    
    // Populate modal content
    document.getElementById('roleDetailTitle').textContent = role.title;
    document.getElementById('roleDetailDepartment').textContent = role.department;
    document.getElementById('roleDetailSummary').textContent = role.summary;
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
    iconContainer.innerHTML = roleIcons[role.icon] || roleIcons['volunteers'];

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
}

// Enhanced Volunteer Role Board
function loadRoles() {
    try {
        // Check if we should show draft roles
        const showDraft = new URLSearchParams(window.location.search).get('preview') === 'true';
        
        // Get role board container
        const roleBoard = document.querySelector('.role-board');
        if (!roleBoard) return;

        // Filter and group roles
        const openRoles = rolesData.filter(role => role.status === 'open');
        const closedRoles = rolesData.filter(role => role.status === 'closed');
        const draftRoles = rolesData.filter(role => role.status === 'draft');

        // Create columns
        const columns = {
            open: createRoleColumn('Open Roles', openRoles),
            closed: createRoleColumn('Closed Roles', closedRoles),
            draft: showDraft ? createRoleColumn('Draft Roles', draftRoles) : null
        };

        // Clear and populate role board
        roleBoard.innerHTML = '';
        Object.values(columns).forEach(column => {
            if (column) roleBoard.appendChild(column);
        });

        // Add click handlers for role cards (to show details)
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

function createRoleColumn(title, roles) {
    const column = document.createElement('div');
    column.className = 'role-column';
    
    column.innerHTML = `
        <h3>${title}</h3>
        ${roles.map(role => createRoleCard(role)).join('')}
    `;
    
    return column;
}

function createRoleCard(role) {
    const isOpen = role.status === 'open';
    
    return `
        <div class="role-card ${!isOpen ? 'closed' : ''}" data-role-id="${role.id}" style="cursor: pointer;" tabindex="0" role="button" aria-label="View details for ${role.title}">
            <div class="role-card-header">
                <div class="role-card-icon">${roleIcons[role.icon] || roleIcons['volunteers']}</div>
                <div class="role-card-meta">
                    <h4>${role.title}</h4>
                    <span class="role-department">${role.department}</span>
                </div>
            </div>
            <p>${role.summary}</p>
            <div class="role-card-actions">
                <button class="button secondary view-details" onclick="event.stopPropagation(); openRoleDetailModal('${role.id}')" aria-label="View details for ${role.title}">View Details</button>
                ${isOpen ? `
                    <a href="apply.html" class="button primary" onclick="event.stopPropagation()" aria-label="Apply for ${role.title}">Apply Now</a>
                ` : `
                    <span class="button disabled" aria-label="Applications closed for ${role.title}">Applications Closed</span>
                `}
            </div>
        </div>
    `;
}

// Initialize all functionality when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize role detail modal
    if (document.getElementById('roleDetailModal')) {
        initializeRoleDetailModal();
    }
    
    // Load roles if we're on the volunteer page
    if (window.location.pathname.includes('volunteer')) {
        loadRoles();
    }
}); 