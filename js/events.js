// CT5 Pride Events Management
class EventsManager {
    constructor() {
        this.events = [];
        this.init();
    }

    async init() {
        await this.loadEvents();
        this.renderEvents();
    }

    async loadEvents() {
        try {
            console.log('🔄 Loading events...');
            
            // Try to load from server API first
            try {
                const response = await fetch('/api/eventbrite-events');
                const result = await response.json();
                
                if (result.success && result.events) {
                    this.events = result.events;
                    console.log(`✅ Loaded ${this.events.length} events from API`);
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
                    console.log(`✅ Loaded ${this.events.length} events from local config`);
                } catch (configError) {
                    console.error('❌ Failed to load events from config:', configError);
                    this.events = [];
                }
            }
            
        } catch (error) {
            console.error('❌ Error loading events:', error);
            this.events = [];
        }
    }

    renderEvents() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) {
            console.error('❌ eventsContainer element not found!');
            return;
        }

        // Filter upcoming events (events that haven't ended yet)
        const now = new Date();
        const upcomingEvents = this.events.filter(event => {
            const eventEndDate = new Date(event.end_date);
            return eventEndDate > now;
        }).sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

        if (upcomingEvents.length === 0) {
            this.showNoEventsMessage();
            return;
        }

        const eventsHTML = upcomingEvents.map(event => this.renderEventCard(event)).join('');
        eventsContainer.innerHTML = eventsHTML;

        // Bind event card interactions
        this.bindEventCardEvents();
    }

    renderEventCard(event) {
        const eventDate = new Date(event.start_date);
        const eventEndDate = new Date(event.end_date);
        const eventUrl = event.url || `https://www.eventbrite.co.uk/e/${event.id}`;
        
        // Format date and time
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit' 
        };

        const formattedDate = eventDate.toLocaleDateString('en-GB', dateOptions);
        const startTime = eventDate.toLocaleTimeString('en-GB', timeOptions);
        const endTime = eventEndDate.toLocaleTimeString('en-GB', timeOptions);

        // Use custom summary if available, otherwise truncate description
        const summary = event.customSummary || this.truncateDescription(event.description || '', 200);
        const ctaText = event.customCta || 'RSVP Now';

        return `
            <div class="event-card" data-event-id="${event.id}">
                <div class="event-card-header">
                    ${event.logo ? `<img src="${event.logo}" alt="${event.title}" class="event-logo">` : ''}
                    <div class="event-card-title">
                        <h3>${event.title}</h3>
                        <div class="event-meta">
                            <span class="event-date">📅 ${formattedDate}</span>
                            <span class="event-time">🕐 ${startTime} - ${endTime}</span>
                            ${event.venue?.name ? `<span class="event-location">📍 ${event.venue.name}</span>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="event-card-content">
                    <p class="event-summary">${summary}</p>
                    
                    <div class="event-card-actions">
                        <a href="${eventUrl}" target="_blank" rel="noopener noreferrer" class="button primary event-rsvp-btn">
                            🎫 ${ctaText}
                        </a>
                        <button class="button secondary event-details-btn" data-event-id="${event.id}">
                            ℹ️ View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    truncateDescription(description, maxLength) {
        // Remove HTML tags and truncate
        const plainText = description.replace(/<[^>]*>/g, '');
        if (plainText.length <= maxLength) {
            return plainText;
        }
        return plainText.substring(0, maxLength) + '...';
    }

    bindEventCardEvents() {
        // Bind "View Details" buttons
        const detailButtons = document.querySelectorAll('.event-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const eventId = button.dataset.eventId;
                this.showEventModal(eventId);
            });
        });
    }

    async showEventModal(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const eventDate = new Date(event.start_date);
        const eventEndDate = new Date(event.end_date);
        const eventUrl = event.url || `https://www.eventbrite.co.uk/e/${event.id}`;

        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit' 
        };

        const formattedDate = eventDate.toLocaleDateString('en-GB', dateOptions);
        const startTime = eventDate.toLocaleTimeString('en-GB', timeOptions);
        const endTime = eventEndDate.toLocaleTimeString('en-GB', timeOptions);

        const modalHTML = `
            <div class="event-modal" id="eventModal">
                <div class="event-modal-content">
                    <div class="event-modal-header">
                        <h2>${event.title}</h2>
                        <button class="event-modal-close" onclick="this.closest('.event-modal').remove()">×</button>
                    </div>
                    
                    <div class="event-modal-body">
                        <div class="event-modal-details">
                            <div class="event-detail-item">
                                <strong>📅 Date:</strong> ${formattedDate}
                            </div>
                            <div class="event-detail-item">
                                <strong>🕐 Time:</strong> ${startTime} - ${endTime}
                            </div>
                            ${event.venue?.name ? `
                                <div class="event-detail-item">
                                    <strong>📍 Location:</strong> ${event.venue.name}
                                    ${event.venue.address ? `<br><span class="event-address">${event.venue.address}</span>` : ''}
                                </div>
                            ` : ''}
                            ${event.category ? `
                                <div class="event-detail-item">
                                    <strong>🏷️ Category:</strong> ${event.category}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="event-modal-description">
                            <h3>About This Event</h3>
                            <div class="event-description-content">
                                ${event.description || 'No description available'}
                            </div>
                        </div>
                        
                        <div class="event-modal-actions">
                            <a href="${eventUrl}" target="_blank" rel="noopener noreferrer" class="button primary">
                                🎫 ${event.customCta || 'RSVP Now'}
                            </a>
                            <button class="button secondary" onclick="this.closest('.event-modal').remove()">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove any existing modal
        const existingModal = document.getElementById('eventModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Add click outside to close
        const modal = document.getElementById('eventModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showNoEventsMessage() {
        const eventsContainer = document.getElementById('eventsContainer');
        if (!eventsContainer) return;

        eventsContainer.innerHTML = `
            <div class="no-events-message">
                <h3>📅 No Events Currently Scheduled</h3>
                <p>
                    We're currently planning exciting events for our community! Follow us on social media 
                    or join our mailing list to be the first to know about upcoming celebrations and gatherings.
                </p>
                <div class="no-events-actions">
                    <a href="contact.html" class="button">Get Updates</a>
                    <a href="get-involved.html" class="button secondary">Get Involved</a>
                </div>
            </div>
        `;
    }
}

// Initialize events when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EventsManager();
}); 