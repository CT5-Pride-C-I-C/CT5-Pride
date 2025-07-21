// CT5 Pride Main JavaScript
// Handles navigation, accessibility, and events loading

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
        
        // Try to fetch events from the admin API (check both endpoints)
        let response, data;
        
        try {
            // First try admin API endpoint
            response = await fetch('/api/events');
            if (response.ok) {
                data = await response.json();
                console.log('📅 Events data received from admin API:', data);
            } else {
                throw new Error(`Admin API returned ${response.status}`);
            }
        } catch (adminError) {
            console.log('ℹ️ Admin API not available, trying Eventbrite directly...');
            
            // Fallback: Try to fetch from Eventbrite directly (if public endpoint available)
            try {
                response = await fetch('https://www.eventbriteapi.com/v3/users/me/events/?token=EVENTBRITE_PUBLIC_TOKEN');
                if (response.ok) {
                    const eventbriteData = await response.json();
                    data = {
                        success: true,
                        events: eventbriteData.events || []
                    };
                } else {
                    throw new Error(`Eventbrite API returned ${response.status}`);
                }
            } catch (eventbriteError) {
                console.log('⚠️ Both admin API and Eventbrite direct access failed');
                throw new Error(`Unable to load events: ${adminError.message}`);
            }
        }
        
        // Check if we have valid events data
        if (data.success && data.events && Array.isArray(data.events) && data.events.length > 0) {
            // Display events
            renderEvents(data.events);
        } else {
            // No events found - show professional empty state
            showNoEvents();
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
        <div class="no-events">
            <div class="no-events-icon">📅</div>
            <h3>No upcoming events at this time</h3>
            <p>We're always planning exciting new events for the CT5 Pride community! Check back soon or follow us on social media for the latest updates.</p>
            <div class="no-events-actions">
                <a href="get-involved.html" class="btn">Get Involved</a>
                <a href="contact.html" class="btn secondary">Contact Us</a>
            </div>
        </div>
    `;
    
    console.log('ℹ️ Displayed no events message');
}

function showEventsError(errorMessage) {
    const eventsContainer = document.getElementById('eventsContainer');
    
    eventsContainer.innerHTML = `
        <div class="event-error">
            <div class="error-icon">⚠️</div>
            <h3>We couldn't load events right now</h3>
            <p>Please try again later or contact us if the problem persists.</p>
            <details class="error-details">
                <summary>Technical details</summary>
                <p><code>${escapeHtml(errorMessage)}</code></p>
            </details>
            <div class="error-actions">
                <button onclick="loadEvents()" class="btn">Try Again</button>
                <a href="contact.html" class="btn secondary">Contact Us</a>
            </div>
        </div>
    `;
    
    console.log('❌ Displayed events error message');
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

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ CT5 Pride DOM loaded, initializing...');
    
    setupNavigation();
    setupAccessibility();
    
    // Load events if on events page
    if (document.getElementById('eventsContainer')) {
        loadEvents();
    }
    
    console.log('🏳️‍🌈 CT5 Pride initialization complete');
});

// Make loadEvents available globally for retry buttons
window.loadEvents = loadEvents; 