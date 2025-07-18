// Header Functionality
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const header = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.main-nav');
    
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
                !e.target.closest('.main-nav') && 
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
            }
        });
    }

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
});

// Volunteer Role Board - Embedded Data
const rolesData = [
    {
        "title": "Parade Coordinator",
        "category": "Year-Round",
        "status": "open",
        "summary": "Help plan and coordinate our annual pride parade. Looking for someone with event planning experience and great organizational skills.",
        "applyLink": "#apply"
    },
    {
        "title": "Social Media Manager",
        "category": "Year-Round",
        "status": "open",
        "summary": "Create engaging content and manage our social media presence across Instagram and Facebook.",
        "applyLink": "#apply"
    },
    {
        "title": "Community Outreach Lead",
        "category": "Year-Round",
        "status": "closed",
        "summary": "Build relationships with local LGBTQIA+ organizations and allies in the CT5 area.",
        "applyLink": ""
    },
    {
        "title": "Volunteer Coordinator",
        "category": "Year-Round",
        "status": "closed",
        "summary": "Manage our amazing volunteer team and help match people with the right opportunities.",
        "applyLink": ""
    },
    {
        "title": "Fundraising Director",
        "category": "Year-Round",
        "status": "draft",
        "summary": "Lead our fundraising efforts and develop relationships with sponsors and donors.",
        "applyLink": ""
    },
    {
        "title": "Youth Engagement Officer",
        "category": "Year-Round",
        "status": "draft",
        "summary": "Create and coordinate programs specifically for LGBTQIA+ youth in our community.",
        "applyLink": ""
    }
];

// Application Form Handling
function initializeApplicationForm() {
    const modal = document.getElementById('applicationModal');
    const form = document.getElementById('applicationForm');
    const successMessage = document.getElementById('successMessage');
    const roleTitleElement = document.getElementById('roleTitle');

    // Close modal function
    function closeModal() {
        modal.style.display = 'none';
        form.reset();
        form.style.display = 'block';
        successMessage.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Add close handlers
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate form
        if (!form.checkValidity()) {
            // Trigger browser's native validation UI
            form.reportValidity();
            return;
        }

        // Hide form and show success message
        form.style.display = 'none';
        successMessage.style.display = 'block';

        // Close modal after 3 seconds
        setTimeout(closeModal, 3000);
    });
}

// Volunteer Role Board
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

        // Add click handlers for apply buttons
        document.querySelectorAll('[data-role-title]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const roleTitle = button.getAttribute('data-role-title');
                openApplicationModal(roleTitle);
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
        <div class="role-card ${!isOpen ? 'closed' : ''}">
            <h4>${role.title}</h4>
            <p>${role.summary}</p>
            ${isOpen ? `
                <button class="button" data-role-title="${role.title}">Apply Now</button>
            ` : `
                <span class="button" style="opacity: 0.5; cursor: not-allowed;">Applications Closed</span>
            `}
        </div>
    `;
}

function openApplicationModal(roleTitle) {
    const modal = document.getElementById('applicationModal');
    const roleTitleElement = document.getElementById('roleTitle');
    
    roleTitleElement.textContent = roleTitle;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Initialize role board if we're on the volunteer page
if (window.location.pathname.includes('volunteer')) {
    loadRoles();
} 