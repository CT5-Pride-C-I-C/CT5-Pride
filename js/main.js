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
                const newState = !isChecked;
                
                // Update both aria-checked and visual state
                toggle.setAttribute('aria-checked', newState);
                toggle.classList.toggle('active', newState);
                
                const setting = toggle.dataset.setting;
                document.body.classList.toggle(setting, newState);
                
                // Save preference
                localStorage.setItem(`ct5pride-${setting}`, newState);
                
                // Announce change for screen readers
                announceToggleChange(setting, newState);
            });
            
            // Add keyboard support
            toggle.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle.click();
                }
            });
            
            // Load saved preferences
            const setting = toggle.dataset.setting;
            const saved = localStorage.getItem(`ct5pride-${setting}`);
            if (saved === 'true') {
                toggle.setAttribute('aria-checked', 'true');
                toggle.classList.add('active');
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

function announceToggleChange(setting, isEnabled) {
    // Create accessible announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    const settingNames = {
        'high-contrast': 'High Contrast Mode',
        'dyslexia-friendly': 'Dyslexia Friendly Font',
        'reduce-motion': 'Reduce Motion'
    };
    
    const settingName = settingNames[setting] || setting;
    const state = isEnabled ? 'enabled' : 'disabled';
    
    announcement.textContent = `${settingName} ${state}`;
    document.body.appendChild(announcement);
    
    // Remove announcement after screen readers have processed it
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 1000);
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
        
        // Try to fetch events from the admin API (no auth required for public view)
        let response, data;
        let hasNetworkError = false;
        
        try {
            // Try to fetch public events endpoint (we need to create this)
            response = await fetch('/api/events/public');
            
            if (response.ok) {
                data = await response.json();
                console.log('📅 Events data received from public API:', data);
            } else if (response.status === 404) {
                // 404 means no events configured, not an error
                console.log('ℹ️ Public API returned 404 - no events configured');
                data = { success: true, events: [] };
            } else {
                // Other HTTP errors are actual problems
                console.log(`⚠️ Public API returned ${response.status}, trying fallback...`);
                hasNetworkError = true;
                throw new Error(`Public API returned ${response.status}`);
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
        // Handle different date formats from auto-sync vs manual sync
        const startDate = new Date(event.start_time || event.start?.utc || event.start_date);
        const endDate = new Date(event.end_time || event.end?.utc || event.end_date);
        
        // Handle different location formats
        let location = '';
        if (event.venue_name) {
            location = event.venue_name;
            if (event.venue_address) {
                location += `, ${event.venue_address}`;
            }
        } else if (event.venue?.name) {
            location = event.venue.name;
        } else if (event.location) {
            location = event.location;
        }
        
        // Handle different title and description formats
        const title = event.title || event.name?.text || event.name || 'Untitled Event';
        const description = event.description || event.description?.text || '';
        
        return `
            <div class="event-card">
                <div class="event-header">
                    <h3 class="event-title">${escapeHtml(title)}</h3>
                    <div class="event-date">
                        <span class="date-main">${startDate.toLocaleDateString('en-GB', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                        })}</span>
                        ${endDate && endDate.toDateString() !== startDate.toDateString() ? 
                            `<span class="date-range">- ${endDate.toLocaleDateString('en-GB', { 
                                day: 'numeric', 
                                month: 'short' 
                            })}</span>` : ''
                        }
                    </div>
                </div>
                
                <div class="event-details">
                    ${location ? `<p class="event-location">📍 ${escapeHtml(location)}</p>` : ''}
                    ${description ? `<p class="event-description">${escapeHtml(description.substring(0, 150))}${description.length > 150 ? '...' : ''}</p>` : ''}
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
    
    // Clear any previously stored theme data to ensure fresh start
    localStorage.removeItem('ct5pride-theme');
    
    const prideFlags = document.querySelectorAll('.pride-flag-icon[data-theme]');
    
    // Always start with default theme (no persistence)
    updateActiveFlag('default');
    
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
    console.log(`🎨 Switching to ${newTheme} theme (temporary)`);
    
    // Remove all existing theme classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    // Apply new theme (temporary only - no localStorage)
    if (newTheme !== 'default') {
        applyTheme(newTheme);
    }
    
    // Update active flag indicator
    updateActiveFlag(newTheme);
    
    // Dispatch custom event for accessibility tools
    window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: newTheme, temporary: true } 
    }));
}

function applyTheme(theme) {
    // Add fade transition class
    document.body.classList.add('theme-transitioning');
    
    // Apply theme after short delay for smooth transition
    setTimeout(() => {
        document.body.classList.add(`theme-${theme}`);
        
        // Remove transition class after animation
        setTimeout(() => {
            document.body.classList.remove('theme-transitioning');
        }, 500);
    }, 50);
    
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
        progress: '#d62d20',
        trans: '#5bcffa',
        nonbinary: '#9c59d1',
        lesbian: '#d62d20',
        gay: '#078d70',
        bisexual: '#d60270',
        pansexual: '#ff218c',
        asexual: '#800080',
        bear: '#654321',
        default: '#e91e63'
    };
    
    metaThemeColor.content = themeColors[theme] || themeColors.default;
    
    // Add visual celebration effect
    addThemeCelebrationEffect(theme);
}

function addThemeCelebrationEffect(theme) {
    // Create a subtle confetti-like effect
    const celebration = document.createElement('div');
    celebration.className = 'theme-celebration';
    celebration.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const themeColors = {
        rainbow: ['#e40303', '#ff8c00', '#ffed00', '#008018', '#004cff', '#732982'],
        progress: ['#5bcffa', '#f5a9b8', '#ffffff', '#784f17', '#000000'],
        trans: ['#5bcffa', '#f5a9b8', '#ffffff'],
        nonbinary: ['#fcf434', '#ffffff', '#9c59d1', '#2c2c2c'],
        lesbian: ['#d62d20', '#ff9955', '#ffffff', '#d161a2', '#a20160'],
        gay: ['#078d70', '#26ceaa', '#98e8c1', '#ffffff', '#7bade2', '#5049cc'],
        bisexual: ['#d60270', '#9b59b6', '#0038a8'],
        pansexual: ['#ff218c', '#ffd800', '#21b1ff'],
        asexual: ['#000000', '#a3a3a3', '#ffffff', '#800080'],
        bear: ['#654321', '#d2691e', '#ffdd44', '#ffeaa7', '#ffffff', '#666666', '#000000'],
        default: ['#e91e63', '#2196f3', '#e91e63']
    };
    
    const colors = themeColors[theme] || themeColors.default;
    
    // Create sparkle elements
    for (let i = 0; i < 15; i++) {
        const sparkle = document.createElement('div');
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: sparkleFloat 1.5s ease-out forwards;
            box-shadow: 0 0 6px currentColor;
        `;
        celebration.appendChild(sparkle);
    }
    
    document.body.appendChild(celebration);
    
    // Trigger animation
    requestAnimationFrame(() => {
        celebration.style.opacity = '1';
    });
    
    // Remove after animation
    setTimeout(() => {
        if (celebration.parentNode) {
            celebration.parentNode.removeChild(celebration);
        }
    }, 1500);
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
        asexual: 'Asexual Pride',
        bear: 'Bear Pride'
    };
    
    const themeDescriptions = {
        default: 'Original CT5 Pride colors restored',
        rainbow: 'Classic rainbow pride colors applied with vibrant red, orange, yellow, green, blue, and purple',
        progress: 'Progress Pride colors with inclusion stripes featuring trans, brown, and black representation',
        trans: 'Transgender pride colors in light blue, pink, and white',
        nonbinary: 'Non-binary pride colors in yellow, white, purple, and black',
        lesbian: 'Lesbian pride colors in orange, white, and pink tones',
        gay: 'Gay pride colors in teal, green, and blue tones',
        bisexual: 'Bisexual pride colors in pink, purple, and blue',
        pansexual: 'Pansexual pride colors in pink, yellow, and blue',
        asexual: 'Asexual pride colors in black, gray, white, and purple',
        bear: 'Bear pride colors in brown, orange, yellow, beige, white, gray, and black representing the bear community'
    };
    
    announcement.textContent = `${themeNames[theme]} theme temporarily activated. ${themeDescriptions[theme]}. Footer, header, and website elements updated with new color scheme. Theme will reset on page refresh.`;
    document.body.appendChild(announcement);
    
    // Also show a brief visual notification
    showThemeNotification(themeNames[theme]);
    
    // Remove announcement after screen readers have processed it
    setTimeout(() => {
        if (announcement.parentNode) {
            announcement.parentNode.removeChild(announcement);
        }
    }, 2000);
}

function showThemeNotification(themeName) {
    // Create a brief visual notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary, #e91e63);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 320px;
        font-size: 0.85rem;
        line-height: 1.4;
    `;
    
    if (themeName === 'Default CT5 Pride') {
        notification.innerHTML = `🏳️‍🌈 <strong>Default Theme Restored</strong>`;
    } else {
        notification.innerHTML = `🏳️‍🌈 <strong>${themeName} Theme Active</strong><br><small>Temporary - resets on refresh</small>`;
    }
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
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