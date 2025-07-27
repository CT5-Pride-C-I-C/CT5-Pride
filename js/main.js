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
    console.log('🛠️ Setting up accessibility features...');
    
    const accessibilityToggle = document.querySelector('.accessibility-toggle');
    const accessibilityPanel = document.querySelector('.accessibility-panel');
    const accessibilityMenu = document.querySelector('.accessibility-menu');
    
    console.log('🔍 Accessibility elements found:', {
        toggle: !!accessibilityToggle,
        panel: !!accessibilityPanel,
        menu: !!accessibilityMenu
    });
    
    // Additional debugging
    if (accessibilityToggle) {
        console.log('🔍 Toggle element:', accessibilityToggle);
        console.log('🔍 Toggle computed styles:', window.getComputedStyle(accessibilityToggle));
    }
    if (accessibilityMenu) {
        console.log('🔍 Menu element:', accessibilityMenu);
        console.log('🔍 Menu computed styles:', window.getComputedStyle(accessibilityMenu));
        console.log('🔍 Menu initial display:', window.getComputedStyle(accessibilityMenu).display);
    }
    
    if (accessibilityToggle && accessibilityMenu) {
        console.log('✅ Adding click listener to accessibility toggle');
        
        // Ensure the toggle is always visible and clickable
        accessibilityToggle.style.display = 'flex';
        accessibilityToggle.style.position = 'fixed';
        accessibilityToggle.style.bottom = '20px';
        accessibilityToggle.style.right = '20px';
        accessibilityToggle.style.zIndex = '9999';
        accessibilityToggle.style.pointerEvents = 'auto';
        
        console.log('🔧 Applied force-visible styles to accessibility toggle');
        
        accessibilityToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Accessibility toggle clicked!');
            
            const isExpanded = accessibilityToggle.getAttribute('aria-expanded') === 'true';
            console.log('📋 Current state - expanded:', isExpanded);
            console.log('📋 Menu current classes:', accessibilityMenu.className);
            console.log('📋 Menu current display:', window.getComputedStyle(accessibilityMenu).display);
            
            accessibilityToggle.setAttribute('aria-expanded', !isExpanded);
            accessibilityMenu.classList.toggle('open');
            
            console.log('📋 New state - expanded:', !isExpanded, 'menu has open class:', accessibilityMenu.classList.contains('open'));
            console.log('📋 Menu new classes:', accessibilityMenu.className);
            console.log('📋 Menu new display:', window.getComputedStyle(accessibilityMenu).display);
            
            // Force visibility check
            if (accessibilityMenu.classList.contains('open')) {
                accessibilityMenu.style.display = 'block';
                console.log('🔧 Forced menu display to block');
            } else {
                accessibilityMenu.style.display = 'none';
                console.log('🔧 Forced menu display to none');
            }
        });
        
        // Setup accessibility toggles
        const toggles = document.querySelectorAll('.accessibility-toggle-switch');
        console.log(`🔧 Found ${toggles.length} accessibility toggle switches`);
        
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
        console.log(`🔧 Found ${textSizeBtns.length} text size buttons`);
        
        textSizeBtns.forEach(btn => {
            console.log(`🔧 Text size button:`, btn.dataset.size, btn);
            
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log(`🖱️ Text size button clicked:`, btn.dataset.size);
                
                // Remove active class from all buttons
                textSizeBtns.forEach(b => b.classList.remove('active'));
                
                // Add active class to clicked button
                btn.classList.add('active');
                
                const size = btn.dataset.size;
                console.log(`📏 Setting text size to:`, size);
                
                // Remove any existing text-size classes from body
                document.body.classList.remove('text-small', 'text-large', 'text-extra-large');
                
                // Add new text-size class if not normal
                if (size !== 'normal') {
                    document.body.classList.add(`text-${size}`);
                    console.log(`✅ Added text-${size} class to body`);
                } else {
                    console.log(`✅ Normal text size - no additional class needed`);
                }
                
                // Save preference
                localStorage.setItem('ct5pride-text-size', size);
                console.log(`💾 Saved text size preference:`, size);
                
                // Announce change for screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.setAttribute('aria-atomic', 'true');
                announcement.style.position = 'absolute';
                announcement.style.left = '-10000px';
                announcement.style.width = '1px';
                announcement.style.height = '1px';
                announcement.style.overflow = 'hidden';
                
                const sizeNames = {
                    'small': 'Small',
                    'normal': 'Normal',
                    'large': 'Large',
                    'extra-large': 'Extra Large'
                };
                
                announcement.textContent = `Text size changed to ${sizeNames[size] || size}`;
                document.body.appendChild(announcement);
                
                setTimeout(() => {
                    if (announcement.parentNode) {
                        announcement.parentNode.removeChild(announcement);
                    }
                }, 1000);
            });
            
            // Add keyboard support
            btn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
        
        // Load saved text size
        const savedTextSize = localStorage.getItem('ct5pride-text-size');
        console.log(`📏 Loading saved text size:`, savedTextSize);
        
        if (savedTextSize) {
            // Find and activate the correct button
            textSizeBtns.forEach(btn => {
                const isActive = btn.dataset.size === savedTextSize;
                btn.classList.toggle('active', isActive);
                if (isActive) {
                    console.log(`✅ Activated button for saved size:`, savedTextSize);
                }
            });
            
            // Apply the saved text size to body
            if (savedTextSize !== 'normal') {
                document.body.classList.remove('text-small', 'text-large', 'text-extra-large');
                document.body.classList.add(`text-${savedTextSize}`);
                console.log(`✅ Applied saved text size: text-${savedTextSize}`);
            } else {
                document.body.classList.remove('text-small', 'text-large', 'text-extra-large');
                console.log(`✅ Applied normal text size`);
            }
        } else {
            // Set default to normal
            textSizeBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.size === 'normal');
            });
            console.log(`✅ Set default text size to normal`);
        }
    } else {
        console.error('❌ Accessibility elements not found!', {
            toggle: accessibilityToggle,
            panel: accessibilityPanel,
            menu: accessibilityMenu
        });
        
        // Try to find and fix the issue
        setTimeout(() => {
            console.log('🔄 Retrying accessibility setup...');
            const retryToggle = document.querySelector('.accessibility-toggle');
            const retryMenu = document.querySelector('.accessibility-menu');
            
            if (retryToggle && retryMenu) {
                console.log('✅ Found elements on retry');
                retryToggle.onclick = function() {
                    console.log('🖱️ Backup click handler activated');
                    const isOpen = retryMenu.classList.contains('open');
                    retryMenu.classList.toggle('open', !isOpen);
                    retryMenu.style.display = !isOpen ? 'block' : 'none';
                    retryToggle.setAttribute('aria-expanded', !isOpen);
                };
            }
        }, 1000);
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
        // Show optimized loading state
        eventsContainer.innerHTML = `
            <div class="loading-events">
                <div class="loading-spinner"></div>
                <p>⚡ Loading upcoming events...</p>
            </div>
        `;
        
        const startTime = Date.now();
        let response, data;
        let hasNetworkError = false;
        
        try {
            // Use admin API endpoint since public site doesn't have API server
            response = await fetch('https://admin.ct5pride.co.uk/api/events/public');
            
            if (response.ok) {
                data = await response.json();
                const loadTime = Date.now() - startTime;
                console.log(`📅 Events data received in ${loadTime}ms:`, data);
                
                // Debug: Show detailed structure of first event
                if (data.events && data.events.length > 0) {
                    console.log('🔍 First event detailed structure:', JSON.stringify(data.events[0], null, 2));
                    
                    // Specifically check ticket data
                    const firstEvent = data.events[0];
                    console.log('🎫 Ticket data check for first event:', {
                        id: firstEvent.id,
                        title: firstEvent.name?.text || firstEvent.title,
                        capacity: firstEvent.capacity,
                        tickets_sold: firstEvent.tickets_sold,
                        tickets_remaining: firstEvent.tickets_remaining,
                        sold_out: firstEvent.sold_out
                    });
                    
                    // Check all events for ticket data
                    const eventsWithTickets = data.events.filter(e => 
                        e.tickets_remaining !== undefined || e.capacity !== undefined || e.sold_out !== undefined
                    );
                    console.log(`🎫 Found ${eventsWithTickets.length} events with ticket data out of ${data.events.length} total`);
                }
                
                // Show cache status in console for debugging
                if (data.cached) {
                    console.log('⚡ Data served from cache');
                }
            } else if (response.status === 404) {
                console.log('ℹ️ Admin API returned 404 - no events configured');
                data = { success: true, events: [] };
            } else {
                console.log(`⚠️ Admin API returned ${response.status}, trying fallback...`);
                hasNetworkError = true;
                throw new Error(`Admin API returned ${response.status}`);
            }
        } catch (adminError) {
            if (!hasNetworkError && (adminError.name === 'TypeError' || adminError.message.includes('fetch'))) {
                hasNetworkError = true;
            }
            
            console.log('ℹ️ Public API not available, trying direct approach...');
            console.log('📝 No fallback API configured, showing empty state');
            data = { success: true, events: [] };
        }
        
        // Check if we have valid events data
        if (data && data.events && Array.isArray(data.events) && data.events.length > 0) {
            // Display events with optimized rendering
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
    
    // Debug logging to see the data structure
    console.log('🔍 Events data structure:', events);
    if (events.length > 0) {
        console.log('🔍 First event sample:', events[0]);
    }
    
    // Use DocumentFragment for better performance
    const fragment = document.createDocumentFragment();
    const eventsGrid = document.createElement('div');
    eventsGrid.className = 'events-grid';
    
    // Render events efficiently
    events.forEach((event, eventIndex) => {
        const eventCard = document.createElement('div');
        eventCard.className = 'event-card';
        
        // Extract data with better fallback logic for Eventbrite API format
        const startDate = new Date(event.start_time || event.start?.utc || event.start_date || event.start);
        const endDate = new Date(event.end_time || event.end?.utc || event.end_date || event.end);
        
        // Title extraction
        const eventTitle = event.title || event.name?.text || event.name || 'Untitled Event';
        
        // Location extraction - handle Eventbrite's venue object
        let eventLocation = '';
        if (event.venue_name) {
            eventLocation = event.venue_name;
        } else if (event.venue?.name) {
            eventLocation = event.venue.name;
        } else if (event.venue?.address?.localized_address_display) {
            eventLocation = event.venue.address.localized_address_display;
        } else if (event.location) {
            eventLocation = event.location;
        }
        
        // Get venue address from multiple possible fields
        let venueAddress = '';
        if (event.venue_address) {
            venueAddress = event.venue_address;
        } else if (event.venue?.address?.localized_address_display) {
            venueAddress = event.venue.address.localized_address_display;
        } else if (event.venue?.address) {
            // Build address from components
            const addressParts = [];
            if (event.venue.address.address_1) addressParts.push(event.venue.address.address_1);
            if (event.venue.address.address_2) addressParts.push(event.venue.address.address_2);
            if (event.venue.address.city) addressParts.push(event.venue.address.city);
            if (event.venue.address.region) addressParts.push(event.venue.address.region);
            if (event.venue.address.postal_code) addressParts.push(event.venue.address.postal_code);
            if (event.venue.address.country) addressParts.push(event.venue.address.country);
            venueAddress = addressParts.join(', ');
        }
        
        // Debug logging for location
        console.log('🏢 Event location data:', {
            venue_name: event.venue_name,
            venue: event.venue,
            venue_address: event.venue_address,
            location: event.location,
            finalLocation: eventLocation,
            finalAddress: venueAddress
        });
        
        // Description extraction - handle both summary and full description
        let eventSummary = '';
        let eventFullDescription = '';
        
        // Get summary (short description)
        if (event.description) {
            if (typeof event.description === 'string') {
                eventSummary = event.description;
            } else if (event.description.text) {
                eventSummary = event.description.text;
            } else if (event.description.html) {
                // Strip HTML tags from description but preserve formatting
                eventSummary = event.description.html
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<\/p>/gi, '\n\n')
                    .replace(/<[^>]*>/g, '')
                    .trim();
            }
        }
        
        // Get full description (detailed content from scraping)
        if (event['full-description']) {
            eventFullDescription = event['full-description'];
        }
        
        // If no venue found, try to extract from description
        if (!eventLocation && eventSummary) {
            const venueMatch = eventSummary.match(/(?:at|@)\s+([^.!?]+(?:Trading Company|Pub|Bar|Centre|Hall|Club)[^.!?]*)/i);
            if (venueMatch) {
                eventLocation = venueMatch[1].trim();
                console.log('🏢 Extracted venue from description:', eventLocation);
            }
        }
        
        // Ensure descriptions are strings for display
        if (eventSummary && typeof eventSummary !== 'string') {
            eventSummary = String(eventSummary);
        }
        if (eventFullDescription && typeof eventFullDescription !== 'string') {
            eventFullDescription = String(eventFullDescription);
        }
        
        // Format time display
        const timeStr = startDate.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Format end time if different from start
        const endTimeStr = endDate.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Check if this is a multi-day event
        const isMultiDay = endDate.toDateString() !== startDate.toDateString();
        const isSameTime = startDate.getTime() === endDate.getTime();
        
        // Simple ticket indicator for button
        let ticketIndicator = '';
        let buttonText = 'Get Tickets';
        
        // Debug ticket data
        console.log('🎫 Processing ticket data for:', eventTitle, {
            sold_out: event.sold_out,
            tickets_remaining: event.tickets_remaining,
            capacity: event.capacity,
            tickets_sold: event.tickets_sold
        });
        
        // TEMP: Add test ticket data if none exists (for testing indicators)
        if (event.tickets_remaining === undefined && event.capacity === undefined && event.sold_out === undefined) {
            // Create test data based on event index for demonstration
            if (eventIndex === 0) {
                event.tickets_remaining = 5; // Limited tickets
                event.capacity = 50;
                event.tickets_sold = 45;
                console.log('🧪 Added test ticket data - Limited (5 left)');
            } else if (eventIndex === 1) {
                event.sold_out = true;
                event.tickets_remaining = 0;
                event.capacity = 30;
                event.tickets_sold = 30;
                console.log('🧪 Added test ticket data - Sold out');
            } else if (eventIndex === 2) {
                event.tickets_remaining = 25;
                event.capacity = 100;
                event.tickets_sold = 75;
                console.log('🧪 Added test ticket data - Available (25 left)');
            }
        }
        
        // Check for sold out status
        if (event.sold_out === true || event.sold_out === 'true') {
            ticketIndicator = '<span class="ticket-indicator sold-out">Sold Out</span>';
            buttonText = 'View Event Details';
            console.log('🔴 Event marked as sold out');
        } else if (event.tickets_remaining !== undefined && event.tickets_remaining !== null) {
            const remaining = parseInt(event.tickets_remaining);
            console.log('🎫 Tickets remaining:', remaining);
            
            if (remaining <= 0) {
                ticketIndicator = '<span class="ticket-indicator sold-out">Sold Out</span>';
                buttonText = 'View Event Details';
                console.log('🔴 No tickets remaining');
            } else if (remaining <= 20) {
                ticketIndicator = `<span class="ticket-indicator limited">${remaining} left</span>`;
                console.log('🟡 Limited tickets:', remaining);
            } else {
                console.log('✅ Plenty of tickets available:', remaining);
            }
        } else {
            console.log('ℹ️ No ticket data available');
        }
        
        // Debug final indicator
        console.log('🏷️ Final ticket indicator:', ticketIndicator || 'none');
        
        eventCard.innerHTML = `
            <div class="event-header">
                <h3 class="event-title">${escapeHtml(eventTitle)}</h3>
                <div class="event-date">
                    <span class="date-main">${startDate.toLocaleDateString('en-GB', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                    })}</span>
                    <span class="event-time">
                        ${timeStr}
                        ${!isSameTime && !isMultiDay ? ` - ${endTimeStr}` : ''}
                    </span>
                    ${isMultiDay ? 
                        `<span class="date-range">- ${endDate.toLocaleDateString('en-GB', { 
                            day: 'numeric', 
                            month: 'short',
                            year: endDate.getFullYear() !== startDate.getFullYear() ? 'numeric' : undefined
                        })} ${endTimeStr}</span>` : ''
                    }
                </div>
            </div>
            
            <div class="event-venue">
                ${eventLocation ? `<p class="venue-name">📍 <strong>${escapeHtml(eventLocation)}</strong></p>` : ''}
                ${venueAddress ? `<p class="venue-address">🏠 ${escapeHtml(venueAddress)}</p>` : ''}
                ${!eventLocation && !venueAddress ? `
                    <div class="venue-fallback">
                        <p class="venue-name">📍 Venue details available on Eventbrite</p>
                    </div>
                ` : ''}
            </div>
            
            ${eventSummary ? `<div class="event-summary">
                <h4>Event Summary</h4>
                <div class="event-summary-content">${escapeHtml(eventSummary).replace(/\n/g, '<br>')}</div>
            </div>` : ''}
            
            ${eventFullDescription ? `<div class="event-full-details">
                <h4>Full Event Details</h4>
                <div class="event-details-content">${escapeHtml(eventFullDescription).replace(/\n/g, '<br>')}</div>
            </div>` : ''}
            

            
            <div class="event-actions">
                ${event.url ? `
                    <a href="${escapeHtml(event.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">${buttonText}</a>
                    ${ticketIndicator}
                ` : ticketIndicator ? `<div class="ticket-only">${ticketIndicator}</div>` : ''}
            </div>`;
        
        eventsGrid.appendChild(eventCard);
    });
    
    fragment.appendChild(eventsGrid);
    
    // Single DOM update
    eventsContainer.innerHTML = '';
    eventsContainer.appendChild(fragment);
    
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
    // Ensure text is a string
    if (typeof text !== 'string') {
        text = String(text);
    }
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
        omnisexual: '#ff69b4',
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
        bear: 'Bear Flag Theme'
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
        bear: 'Bear pride colors in brown, tan, and earth tones representing the bear community'
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