// CT5 Pride Main JavaScript
// Handles navigation, accessibility, events loading, and theme switching

console.log('🏳️‍🌈 CT5 Pride Main JS Loading...');

// ==================== NAVIGATION ====================

function setupNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('nav');
    
    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            nav.classList.toggle('nav-open');
        });
    }
    
    // Handle dropdown menus
    const dropdowns = document.querySelectorAll('.dropdown > a');
    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = dropdown.parentElement;
            const isOpen = dropdown.getAttribute('aria-expanded') === 'true';
            
            // Close all other dropdowns
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    other.setAttribute('aria-expanded', 'false');
                    other.parentElement.classList.remove('dropdown-open');
                }
            });
            
            // Toggle current dropdown
            dropdown.setAttribute('aria-expanded', !isOpen);
            parent.classList.toggle('dropdown-open');
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.setAttribute('aria-expanded', 'false');
                dropdown.parentElement.classList.remove('dropdown-open');
            });
        }
    });
}

// ==================== ACCESSIBILITY ====================

function setupAccessibility() {
    const accessibilityToggle = document.querySelector('.accessibility-toggle');
    const accessibilityPanel = document.querySelector('.accessibility-panel');
    const accessibilityMenu = document.querySelector('.accessibility-menu');
    
    if (accessibilityToggle && accessibilityMenu) {
        accessibilityToggle.addEventListener('click', () => {
            const isExpanded = accessibilityToggle.getAttribute('aria-expanded') === 'true';
            accessibilityToggle.setAttribute('aria-expanded', !isExpanded);
            accessibilityMenu.classList.toggle('open');
        });
        
        // Setup accessibility toggles
        const toggles = document.querySelectorAll('.accessibility-toggle-switch');
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const isChecked = toggle.getAttribute('aria-checked') === 'true';
                toggle.setAttribute('aria-checked', !isChecked);
                
                const setting = toggle.dataset.setting;
                document.body.classList.toggle(setting, !isChecked);
                
                // Save preference
                localStorage.setItem(`ct5pride-${setting}`, !isChecked);
            });
            
            // Load saved preferences
            const setting = toggle.dataset.setting;
            const saved = localStorage.getItem(`ct5pride-${setting}`);
            if (saved === 'true') {
                toggle.setAttribute('aria-checked', 'true');
                document.body.classList.add(setting);
            }
        });
        
        // Text size controls
        const textSizeBtns = document.querySelectorAll('.text-size-btn');
        textSizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                textSizeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const size = btn.dataset.size;
                document.body.className = document.body.className.replace(/text-size-\w+/g, '');
                if (size !== 'normal') {
                    document.body.classList.add(`text-size-${size}`);
                }
                
                localStorage.setItem('ct5pride-text-size', size);
            });
        });
        
        // Load saved text size
        const savedTextSize = localStorage.getItem('ct5pride-text-size');
        if (savedTextSize) {
            textSizeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.size === savedTextSize);
            });
            if (savedTextSize !== 'normal') {
                document.body.classList.add(`text-size-${savedTextSize}`);
            }
        }
    }
}

// ==================== EVENTS LOADING ====================

async function loadEvents() {
    console.log('🎉 Loading events...');
    
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) {
        console.log('ℹ️ No events container found on this page');
        return;
    }
    
    try {
        // Show loading state
        eventsContainer.innerHTML = `
            <div class="loading-events">
                <div class="loading-spinner"></div>
                <p>Loading upcoming events...</p>
            </div>
        `;
        
        // Try to fetch events from the admin API
        let response, data;
        let hasNetworkError = false;
        
        try {
            // First try admin API endpoint
            response = await fetch('/api/events');
            
            if (response.ok) {
                data = await response.json();
                console.log('📅 Events data received from admin API:', data);
            } else if (response.status === 404) {
                // 404 means no events configured, not an error
                console.log('ℹ️ Admin API returned 404 - no events configured');
                data = { success: true, events: [] };
            } else {
                // Other HTTP errors are actual problems
                console.log(`⚠️ Admin API returned ${response.status}, trying fallback...`);
                hasNetworkError = true;
                throw new Error(`Admin API returned ${response.status}`);
            }
        } catch (adminError) {
            if (!hasNetworkError && (adminError.name === 'TypeError' || adminError.message.includes('fetch'))) {
                // Network/CORS errors are real problems
                hasNetworkError = true;
            }
            
            console.log('ℹ️ Admin API not available, trying direct approach...');
            
            // For now, if admin API fails, just show empty state
            // In the future, could add Eventbrite public API as fallback
            console.log('📝 No fallback API configured, showing empty state');
            data = { success: true, events: [] };
        }
        
        // Check if we have valid events data
        if (data && data.events && Array.isArray(data.events) && data.events.length > 0) {
            // Display events
            renderEvents(data.events);
        } else if (!hasNetworkError) {
            // No events found but API worked - show branded empty state
            showNoEvents();
        } else {
            // Actual network/API error - show error state
            throw new Error('Unable to connect to events service');
        }
        
    } catch (error) {
        console.error('❌ Error loading events:', error);
        showEventsError(error.message);
    }
}

function renderEvents(events) {
    const eventsContainer = document.getElementById('eventsContainer');
    
    const eventsHTML = events.map(event => {
        const startDate = new Date(event.start?.utc || event.start_date);
        const endDate = new Date(event.end?.utc || event.end_date);
        
        return `
            <div class="event-card">
                <div class="event-header">
                    <h3 class="event-title">${escapeHtml(event.name?.text || event.name)}</h3>
                    <div class="event-date">
                        <span class="date-main">${startDate.toLocaleDateString('en-GB', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                        })}</span>
                        ${endDate.toDateString() !== startDate.toDateString() ? 
                            `<span class="date-range">- ${endDate.toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short' 
                            })}</span>` : ''
                        }
                    </div>
                </div>
                
                <div class="event-details">
                    ${event.venue?.name ? `<p class="event-location">📍 ${escapeHtml(event.venue.name)}</p>` : 
                      event.location ? `<p class="event-location">📍 ${escapeHtml(event.location)}</p>` : ''}
                    ${event.description?.text ? `<p class="event-description">${escapeHtml(event.description.text.substring(0, 150))}${event.description.text.length > 150 ? '...' : ''}</p>` : 
                      event.description ? `<p class="event-description">${escapeHtml(event.description.substring(0, 150))}${event.description.length > 150 ? '...' : ''}</p>` : ''}
                </div>
                
                <div class="event-actions">
                    ${event.url ? `<a href="${escapeHtml(event.url)}" target="_blank" rel="noopener noreferrer" class="btn">View Event</a>` : ''}
                    ${event.status ? `<span class="event-status status-${event.status.toLowerCase()}">${escapeHtml(event.status)}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    eventsContainer.innerHTML = `
        <div class="events-grid">
            ${eventsHTML}
        </div>
    `;
    
    console.log(`✅ Rendered ${events.length} events`);
}

function showNoEvents() {
    const eventsContainer = document.getElementById('eventsContainer');
    
    eventsContainer.innerHTML = `
        <div class="no-events-card">
            <h2>🌈 No Events Scheduled… Yet!</h2>
            <p>We're currently planning our next celebration. Please check back soon or follow us for updates!</p>
            <a href="/get-involved.html" class="btn-primary">Get Involved</a>
        </div>
    `;
    
    console.log('ℹ️ Displayed branded no events message');
}

function showEventsError(errorMessage) {
    const eventsContainer = document.getElementById('eventsContainer');
    
    eventsContainer.innerHTML = `
        <div class="events-error-card">
            <h2>🌐 Connection Issue</h2>
            <p>We're having trouble connecting to our events service. This usually resolves quickly.</p>
            <div class="error-actions">
                <button onclick="loadEvents()" class="btn-primary">Try Again</button>
                <a href="/contact.html" class="btn-secondary">Contact Support</a>
            </div>
            <details class="error-details">
                <summary>Technical details</summary>
                <p><code>${escapeHtml(errorMessage)}</code></p>
            </details>
        </div>
    `;
    
    console.log('❌ Displayed connection error message');
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== PRIDE FLAG THEME SWITCHING ====================

function setupPrideFlagThemes() {
    console.log('🏳️‍🌈 Setting up pride flag theme switching...');
    
    const prideFlags = document.querySelectorAll('.pride-flag-icon[data-theme]');
    const currentTheme = localStorage.getItem('ct5pride-theme') || 'default';
    
    // Apply saved theme on load
    if (currentTheme !== 'default') {
        applyTheme(currentTheme);
        updateActiveFlag(currentTheme);
    } else {
        updateActiveFlag('default');
    }
    
    // Add click handlers to all flags
    prideFlags.forEach(flag => {
        flag.addEventListener('click', handleFlagClick);
        flag.addEventListener('keydown', handleFlagKeydown);
    });
}

function handleFlagClick(event) {
    const theme = event.target.dataset.theme;
    if (theme) {
        switchTheme(theme);
        announceThemeChange(theme);
    }
}

function handleFlagKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleFlagClick(event);
    }
}

function switchTheme(newTheme) {
    console.log(`🎨 Switching to ${newTheme} theme`);
    
    // Remove all existing theme classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    // Apply new theme
    if (newTheme !== 'default') {
        applyTheme(newTheme);
        localStorage.setItem('ct5pride-theme', newTheme);
    } else {
        localStorage.removeItem('ct5pride-theme');
    }
    
    // Update active flag indicator
    updateActiveFlag(newTheme);
    
    // Dispatch custom event for accessibility tools
    window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: newTheme } 
    }));
}

function applyTheme(theme) {
    document.body.classList.add(`theme-${theme}`);
    
    // Update meta theme color for mobile browsers
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.name = 'theme-color';
        document.head.appendChild(metaThemeColor);
    }
    
    // Set theme color based on flag
    const themeColors = {
        rainbow: '#e40303',
        progress: '#5bcffa',
        trans: '#5bcffa',
        nonbinary: '#fcf434',
        lesbian: '#d62d20',
        gay: '#078d70',
        bisexual: '#d60270',
        pansexual: '#ff218c',
        asexual: '#800080',
        default: '#e91e63'
    };
    
    metaThemeColor.content = themeColors[theme] || themeColors.default;
}

function updateActiveFlag(activeTheme) {
    // Remove active class from all flags
    document.querySelectorAll('.pride-flag-icon').forEach(flag => {
        flag.classList.remove('active-theme');
        flag.setAttribute('aria-pressed', 'false');
    });
    
    // Add active class to current theme flag
    const activeFlag = document.querySelector(`[data-theme="${activeTheme}"]`);
    if (activeFlag) {
        activeFlag.classList.add('active-theme');
        activeFlag.setAttribute('aria-pressed', 'true');
    }
}

function announceThemeChange(theme) {
    // Create accessible announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    const themeNames = {
        default: 'Default CT5 Pride',
        rainbow: 'Rainbow Pride',
        progress: 'Progress Pride',
        trans: 'Transgender Pride',
        nonbinary: 'Non-Binary Pride',
        lesbian: 'Lesbian Pride',
        gay: 'Gay Pride',
        bisexual: 'Bisexual Pride',
        pansexual: 'Pansexual Pride',
        asexual: 'Asexual Pride'
    };
    
    announcement.textContent = `${themeNames[theme]} theme applied. Website colors updated.`;
    document.body.appendChild(announcement);
    
    // Remove announcement after screen readers have processed it
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
}

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ CT5 Pride DOM loaded, initializing...');
    
    setupNavigation();
    setupAccessibility();
    setupPrideFlagThemes();
    
    // Load events if on events page
    if (document.getElementById('eventsContainer')) {
        loadEvents();
    }
    
    console.log('🏳️‍🌈 CT5 Pride initialization complete');
});

// Make functions available globally
window.loadEvents = loadEvents;
window.switchTheme = switchTheme; 