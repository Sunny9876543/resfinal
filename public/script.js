// Enhanced Socket.IO connection with comprehensive error handling
const socket = io();

// Connection health monitoring
let connectionHealth = {
  isConnected: false,
  reconnectAttempts: 0,
  lastPingTime: null,
  averageLatency: 0
};

// DOM Elements
const connectionStatus = document.getElementById('connectionStatus');
const statusIndicator = connectionStatus.querySelector('.status-indicator');
const statusText = connectionStatus.querySelector('.status-text');
const bookingsList = document.getElementById('bookingsList');
const emptyState = document.getElementById('emptyState');

// Statistics elements
const totalBookingsEl = document.getElementById('totalBookings');
const pendingBookingsEl = document.getElementById('pendingBookings');
const confirmedBookingsEl = document.getElementById('confirmedBookings');
const declinedBookingsEl = document.getElementById('declinedBookings');

// Application state
let bookings = [];
let filteredBookings = [];
let isConnected = false;

// Utility Functions
function formatTimeAgo(timestamp) {
    const now = new Date();
    const bookingTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - bookingTime) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    }
}

// Enhanced connection status with detailed feedback
function updateConnectionStatus(connected, details = {}) {
    isConnected = connected;
    connectionHealth.isConnected = connected;
    
    if (connected) {
        statusIndicator.classList.remove('offline');
        statusIndicator.classList.add('online');
        statusText.textContent = details.reconnected ? 'Reconnected' : 'Connected';
        connectionStatus.style.background = 'var(--success-50)';
        connectionStatus.style.borderColor = 'var(--success-300)';
        
        // Reset reconnect attempts on successful connection
        connectionHealth.reconnectAttempts = 0;
    } else {
        statusIndicator.classList.remove('online');
        statusIndicator.classList.add('offline');
        statusText.textContent = details.attempting ? 
            `Reconnecting... (${connectionHealth.reconnectAttempts})` : 'Disconnected';
        connectionStatus.style.background = 'var(--error-50)';
        connectionStatus.style.borderColor = 'var(--error-300)';
    }
}

function updateStatistics() {
    const pendingCount = bookings.filter(b => b.status === 'pending').length;
    const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
    const declinedCount = bookings.filter(b => b.status === 'declined').length;
    
    // Animate counter updates
    animateCounter(totalBookingsEl, bookings.length);
    animateCounter(pendingBookingsEl, pendingCount);
    animateCounter(confirmedBookingsEl, confirmedCount);
    animateCounter(declinedBookingsEl, declinedCount);
}

function animateCounter(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 500;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = currentValue;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

function createBookingCard(booking) {
    const bookingDiv = document.createElement('div');
    bookingDiv.className = 'booking-card new';
    bookingDiv.id = `booking-${booking.id}`;
    
    const timeAgo = formatTimeAgo(booking.timestamp);
    const statusClass = booking.status === 'confirmed' ? 'confirmed' : '';
    
    bookingDiv.innerHTML = `
        <div class="booking-header">
            <div class="booking-id">Booking #${booking.id}</div>
            <div class="booking-status ${booking.status}">${booking.status}</div>
        </div>
        
        <div class="booking-main">
            <div class="booking-venue">
                <div class="venue-name">${booking.venueName}</div>
                <div class="venue-type">${booking.partyType}</div>
                <div class="customer-name">👤 ${booking.customerName}</div>
            </div>
            
            <div class="booking-party">
                <div class="party-size">${booking.partySize}</div>
                <div class="party-label">Guests</div>
            </div>
            
            <div class="booking-time">
                <div class="time-main">${booking.time}</div>
                <div class="time-ago">${timeAgo}</div>
            </div>
        </div>
        
        ${booking.status === 'pending' ? `
        <div class="booking-actions">
            <button class="btn btn-primary" onclick="confirmBooking(${booking.id})">
                ✅ Confirm Booking
            </button>
            <button class="btn btn-danger" onclick="declineBooking(${booking.id})">
                ❌ Decline Booking
            </button>
            <button class="btn btn-secondary" onclick="viewBookingDetails(${booking.id})">
                👁️ View Details
            </button>
        </div>
        ` : booking.status === 'confirmed' ? `
        <div class="booking-actions">
            <button class="btn btn-secondary" onclick="viewBookingDetails(${booking.id})">
                👁️ View Details
            </button>
        </div>
        ` : `
        <div class="booking-actions">
            <button class="btn btn-secondary" onclick="viewBookingDetails(${booking.id})">
                👁️ View Details
            </button>
            <span class="declined-label">Booking Declined</span>
        </div>
        `}
    `;
    
    return bookingDiv;
}

function addBookingToList(booking, isNew = false) {
    const bookingCard = createBookingCard(booking);
    
    if (isNew) {
        // Check if the new booking matches current filters before adding
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const statusFilter = document.getElementById('statusFilter').value;
        const partySizeFilter = document.getElementById('partySizeFilter').value;
        
        let shouldShow = true;
        
        // Apply search filter
        if (searchTerm) {
            const searchableText = `
                ${booking.venueName} 
                ${booking.partyType} 
                ${booking.customerName} 
                ${booking.id}
            `.toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                shouldShow = false;
            }
        }
        
        // Apply status filter
        if (statusFilter !== 'all' && booking.status !== statusFilter) {
            shouldShow = false;
        }
        
        // Apply party size filter
        if (partySizeFilter !== 'all') {
            const size = parseInt(booking.partySize);
            switch (partySizeFilter) {
                case 'small':
                    if (size < 2 || size > 10) shouldShow = false;
                    break;
                case 'medium':
                    if (size < 11 || size > 25) shouldShow = false;
                    break;
                case 'large':
                    if (size < 26 || size > 50) shouldShow = false;
                    break;
                case 'xlarge':
                    if (size <= 50) shouldShow = false;
                    break;
            }
        }
        
        if (shouldShow) {
            // Add new booking at the top with animation
            bookingsList.insertBefore(bookingCard, bookingsList.firstChild);
            
            // Hide empty state
            emptyState.style.display = 'none';
        } else {
            // Don't add to DOM but still update filteredBookings array
            return;
        }
        
        // Remove 'new' class after animation
        setTimeout(() => {
            bookingCard.classList.remove('new');
        }, 500);
        
        // Flash effect for new bookings
        setTimeout(() => {
            bookingCard.style.background = 'linear-gradient(135deg, var(--success-50) 0%, white 100%)';
            setTimeout(() => {
                bookingCard.style.background = '';
            }, 1000);
        }, 100);
    } else {
        bookingsList.appendChild(bookingCard);
        // Hide empty state when adding bookings
        emptyState.style.display = 'none';
    }
}

function displayInitialBookings(initialBookings) {
    // Clear existing bookings
    bookingsList.innerHTML = '';
    bookings = initialBookings;
    filteredBookings = [...bookings];
    
    if (filteredBookings.length === 0) {
        emptyState.style.display = 'flex';
        return;
    }
    
    // Add all bookings
    filteredBookings.forEach(booking => {
        addBookingToList(booking, false);
    });
    
    updateStatistics();
}

function updateBookingCard(updatedBooking) {
    const bookingCard = document.getElementById(`booking-${updatedBooking.id}`);
    if (bookingCard) {
        const statusElement = bookingCard.querySelector('.booking-status');
        const actionsElement = bookingCard.querySelector('.booking-actions');
        
        // Update status
        statusElement.textContent = updatedBooking.status;
        statusElement.className = `booking-status ${updatedBooking.status}`;
        
        // Update actions if confirmed
        if (updatedBooking.status === 'confirmed') {
            bookingCard.classList.add('confirmed');
            actionsElement.innerHTML = `
                <button class="btn btn-secondary" onclick="viewBookingDetails(${updatedBooking.id})">
                    👁️ View Details
                </button>
            `;
        } else if (updatedBooking.status === 'declined') {
            bookingCard.classList.add('declined');
            actionsElement.innerHTML = `
                <button class="btn btn-secondary" onclick="viewBookingDetails(${updatedBooking.id})">
                    👁️ View Details
                </button>
                <span class="declined-label">Booking Declined</span>
            `;
        }
        
        // Update booking in local state
        const bookingIndex = bookings.findIndex(b => b.id === updatedBooking.id);
        if (bookingIndex !== -1) {
            bookings[bookingIndex] = updatedBooking;
        }
        
        // Update filtered bookings
        const filteredIndex = filteredBookings.findIndex(b => b.id === updatedBooking.id);
        if (filteredIndex !== -1) {
            filteredBookings[filteredIndex] = updatedBooking;
        }
        
        // Check if the updated booking still matches current filters
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        const statusFilter = document.getElementById('statusFilter').value;
        const partySizeFilter = document.getElementById('partySizeFilter').value;
        
        let shouldShow = true;
        
        // Apply status filter
        if (statusFilter !== 'all' && updatedBooking.status !== statusFilter) {
            shouldShow = false;
        }
        
        // Apply search filter
        if (searchTerm) {
            const searchableText = `
                ${updatedBooking.venueName} 
                ${updatedBooking.partyType} 
                ${updatedBooking.customerName} 
                ${updatedBooking.id}
            `.toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                shouldShow = false;
            }
        }
        
        // Apply party size filter
        if (partySizeFilter !== 'all') {
            const size = parseInt(updatedBooking.partySize);
            switch (partySizeFilter) {
                case 'small':
                    if (size < 2 || size > 10) shouldShow = false;
                    break;
                case 'medium':
                    if (size < 11 || size > 25) shouldShow = false;
                    break;
                case 'large':
                    if (size < 26 || size > 50) shouldShow = false;
                    break;
                case 'xlarge':
                    if (size <= 50) shouldShow = false;
                    break;
            }
        }
        
        // Hide the booking card if it no longer matches filters
        if (!shouldShow) {
            bookingCard.style.display = 'none';
            // Remove from filtered bookings
            const filteredIndex = filteredBookings.findIndex(b => b.id === updatedBooking.id);
            if (filteredIndex !== -1) {
                filteredBookings.splice(filteredIndex, 1);
            }
            
            // Show empty state if no bookings are visible
            if (filteredBookings.length === 0) {
                emptyState.style.display = 'flex';
            }
        } else {
            bookingCard.style.display = 'block';
        }
        
        updateStatistics();
    }
}

// Update time ago for all bookings periodically
function updateTimeAgo() {
    const timeAgoElements = document.querySelectorAll('.time-ago');
    timeAgoElements.forEach((element, index) => {
        if (bookings[index]) {
            element.textContent = formatTimeAgo(bookings[index].timestamp);
        }
    });
}

// Filter Functions
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const partySizeFilter = document.getElementById('partySizeFilter').value;
    
    filteredBookings = bookings.filter(booking => {
        // Search filter
        if (searchTerm) {
            const searchableText = `
                ${booking.venueName} 
                ${booking.partyType} 
                ${booking.customerName} 
                ${booking.id}
            `.toLowerCase();
            
            if (!searchableText.includes(searchTerm)) {
                return false;
            }
        }
        
        // Status filter
        if (statusFilter !== 'all' && booking.status !== statusFilter) {
            return false;
        }
        
        // Party size filter
        if (partySizeFilter !== 'all') {
            const size = parseInt(booking.partySize);
            switch (partySizeFilter) {
                case 'small':
                    if (size < 2 || size > 10) return false;
                    break;
                case 'medium':
                    if (size < 11 || size > 25) return false;
                    break;
                case 'large':
                    if (size < 26 || size > 50) return false;
                    break;
                case 'xlarge':
                    if (size <= 50) return false;
                    break;
            }
        }
        
        return true;
    });
    
    // Update display
    bookingsList.innerHTML = '';
    
    if (filteredBookings.length === 0) {
        emptyState.style.display = 'flex';
        const emptyTitle = emptyState.querySelector('h3');
        const emptyText = emptyState.querySelector('p');
        
        if (searchTerm || statusFilter !== 'all' || partySizeFilter !== 'all') {
            emptyTitle.textContent = 'No bookings found';
            if (searchTerm) {
                emptyText.textContent = `No results for "${searchTerm}". Try a different search term or adjust filters.`;
            } else {
                emptyText.textContent = 'No bookings match your current filters. Try adjusting your criteria.';
            }
        } else {
            emptyTitle.textContent = 'Waiting for bookings...';
            emptyText.textContent = 'New bookings will appear here in real-time';
        }
    } else {
        emptyState.style.display = 'none';
        filteredBookings.forEach(booking => {
            addBookingToList(booking, false);
        });
    }
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('partySizeFilter').value = 'all';
    applyFilters();
}

// Modal Functions
function openEventModal(booking) {
    const modal = document.getElementById('eventModal');
    const modalBody = document.getElementById('modalBody');
    
    const statusBadge = booking.status === 'confirmed' ? 
        '<span class="status-badge confirmed">✅ Confirmed</span>' :
        booking.status === 'declined' ?
        '<span class="status-badge declined">❌ Declined</span>' :
        '<span class="status-badge pending">⏳ Pending</span>';
    
    modalBody.innerHTML = `
        <div class="event-details">
            <div class="detail-header">
                <h4>Booking #${booking.id}</h4>
                ${statusBadge}
            </div>
            
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">🏢 Venue</div>
                    <div class="detail-value">${booking.venueName}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">👥 Party Size</div>
                    <div class="detail-value">${booking.partySize} guests</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">🎉 Event Type</div>
                    <div class="detail-value">${booking.partyType}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">👤 Customer</div>
                    <div class="detail-value">${booking.customerName}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">📅 Date & Time</div>
                    <div class="detail-value">${booking.time}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">⏰ Booked</div>
                    <div class="detail-value">${formatTimeAgo(booking.timestamp)}</div>
                </div>
                
                <div class="detail-item">
                    <div class="detail-label">📋 Status</div>
                    <div class="detail-value">${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</div>
                </div>
            </div>
            
            ${booking.status === 'pending' ? `
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="confirmBooking(${booking.id}); closeEventModal();">
                        ✅ Confirm Booking
                    </button>
                    <button class="btn btn-danger" onclick="declineBooking(${booking.id}); closeEventModal();">
                        ❌ Decline Booking
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeEventModal() {
    const modal = document.getElementById('eventModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Connection health monitoring functions
let healthCheckInterval;

function startConnectionHealthCheck() {
    healthCheckInterval = setInterval(() => {
        if (socket.connected) {
            connectionHealth.lastPingTime = Date.now();
            socket.emit('client-ping');
        }
    }, 30000); // Ping every 30 seconds
}

function stopConnectionHealthCheck() {
    if (healthCheckInterval) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Global functions for button interactions
window.confirmBooking = function(bookingId) {
    console.log('🔄 Confirming booking:', bookingId);
    socket.emit('confirm-booking', bookingId);
    
    // Provide immediate feedback
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Confirming...';
    button.disabled = true;
    
    // Reset button after timeout (in case of no response)
    setTimeout(() => {
        if (button.disabled) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }, 3000);
};

window.declineBooking = function(bookingId) {
    console.log('🔄 Declining booking:', bookingId);
    socket.emit('decline-booking', bookingId);
    
    // Provide immediate feedback
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '⏳ Declining...';
    button.disabled = true;
    
    // Reset button after timeout (in case of no response)
    setTimeout(() => {
        if (button.disabled) {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }, 3000);
};

window.viewBookingDetails = function(bookingId) {
    console.log('👁️ Viewing booking details:', bookingId);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        openEventModal(booking);
    }
};

// Enhanced Socket.IO Event Listeners for comprehensive real-time integration
socket.on('connect', () => {
    console.log('✅ Connected to server');
    console.log('🔗 Socket ID:', socket.id);
    updateConnectionStatus(true, { reconnected: connectionHealth.reconnectAttempts > 0 });
    
    // Start connection health monitoring
    startConnectionHealthCheck();
});

socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
    updateConnectionStatus(false);
    
    // Stop health monitoring
    stopConnectionHealthCheck();
});

socket.on('connect_error', (error) => {
    console.error('❌ Connection error:', error);
    updateConnectionStatus(false, { error: error.message });
});

socket.on('initial-bookings', (initialBookings) => {
    console.log('📊 Received initial bookings:', initialBookings.length);
    console.log('🔄 Full-stack data sync completed');
    displayInitialBookings(initialBookings);
});

socket.on('new-booking', (booking) => {
    console.log('🎉 New booking received:', booking);
    console.log('⚡ Real-time update: New booking pushed from server');
    
    // Add to local state
    bookings.unshift(booking);
    
    // Update filtered bookings array
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const statusFilter = document.getElementById('statusFilter').value;
    const partySizeFilter = document.getElementById('partySizeFilter').value;
    
    let shouldAddToFiltered = true;
    
    // Apply search filter
    if (searchTerm) {
        const searchableText = `
            ${booking.venueName} 
            ${booking.partyType} 
            ${booking.customerName} 
            ${booking.id}
        `.toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
            shouldAddToFiltered = false;
        }
    }
    
    // Apply status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
        shouldAddToFiltered = false;
    }
    
    // Apply party size filter
    if (partySizeFilter !== 'all') {
        const size = parseInt(booking.partySize);
        switch (partySizeFilter) {
            case 'small':
                if (size < 2 || size > 10) shouldAddToFiltered = false;
                break;
            case 'medium':
                if (size < 11 || size > 25) shouldAddToFiltered = false;
                break;
            case 'large':
                if (size < 26 || size > 50) shouldAddToFiltered = false;
                break;
            case 'xlarge':
                if (size <= 50) shouldAddToFiltered = false;
                break;
        }
    }
    
    if (shouldAddToFiltered) {
        filteredBookings.unshift(booking);
    }
    
    // Create and add new booking div/list item at the top as per requirements
    addBookingToList(booking, true);
    
    // Update statistics
    updateStatistics();
    
    // Enhanced notification system
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Booking Received!', {
            body: `${booking.venueName} - Party of ${booking.partySize}`,
            icon: '/favicon.ico'
        });
    }
});

socket.on('booking-updated', (updatedBooking) => {
    console.log('📝 Booking updated:', updatedBooking);
    console.log('⚡ Real-time update: Booking status changed');
    updateBookingCard(updatedBooking);
});

// Enhanced booking action responses
socket.on('booking-action-success', (response) => {
    console.log('✅ Booking action successful:', response);
    
    // Show success feedback to user
    if (response.action === 'confirm') {
        showNotification(`Booking confirmed successfully!`, 'info');
    } else if (response.action === 'decline') {
        showNotification(`Booking declined successfully!`, 'error');
    }
});

socket.on('booking-action-error', (error) => {
    console.error('❌ Booking action failed:', error);
    
    // Show error feedback to user
    showNotification(`Error: ${error.message}`, 'error');
});

// Server status monitoring
socket.on('server-status', (status) => {
    console.log('📊 Server status:', status);
    performanceMetrics.serverUptime = status.serverUptime;
    performanceMetrics.connectedClients = status.connectedClients;
});

// Connection health monitoring
socket.on('server-pong', (data) => {
    const latency = Date.now() - connectionHealth.lastPingTime;
    connectionHealth.averageLatency = (connectionHealth.averageLatency + latency) / 2;
    console.log(`🏓 Ping: ${latency}ms (avg: ${Math.round(connectionHealth.averageLatency)}ms)`);
});
socket.on('booking-stats', (stats) => {
    // Update statistics when received from server
    updateStatistics();
});

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Live Bookings Dashboard initialized');
    console.log('🔧 Full-stack integration: Frontend ready');
    console.log('⚡ Real-time features: Socket.IO client ready');
    console.log('🛠️ Problem-solving: Error handling and monitoring active');
    
    // Set up filter event listeners
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('partySizeFilter').addEventListener('change', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
    
    // Modal event listeners
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('eventModal');
        if (event.target === modal) {
            closeEventModal();
        }
    });
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Update time ago every minute
    setInterval(updateTimeAgo, 60000);
    
    // Add some initial loading states
    updateConnectionStatus(false);
    
    // Log client capabilities
    console.log('📡 Client Socket.IO Events:');
    console.log('   - Listening for: new-booking, booking-updated, booking-stats');
    console.log('   - Can emit: confirm-booking, decline-booking, client-ping');
    
    // Show empty state initially
    if (bookings.length === 0) {
        emptyState.style.display = 'flex';
    }
    
    // Start performance monitoring
    console.log('📊 Performance monitoring started');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        // Page became visible, update time ago
        updateTimeAgo();
    }
});

// Error handling for socket connection
socket.on('error', (error) => {
    console.error('Socket error:', error);
    updateConnectionStatus(false);
});

// Reconnection handling
socket.on('reconnect', (attemptNumber) => {
    console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
    console.log('✅ Full-stack connection restored');
    updateConnectionStatus(true, { reconnected: true });
    
    // Request fresh data after reconnection
    socket.emit('request-server-status');
});

socket.on('reconnect_attempt', (attemptNumber) => {
    console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    connectionHealth.reconnectAttempts = attemptNumber;
    updateConnectionStatus(false, { attempting: true });
});

socket.on('reconnect_error', (error) => {
    console.error('❌ Reconnection failed:', error);
    updateConnectionStatus(false, { error: 'Reconnection failed' });
});

socket.on('reconnect_failed', () => {
    console.error('❌ All reconnection attempts failed');
    updateConnectionStatus(false, { error: 'Connection lost' });
    showNotification('Connection lost. Please refresh the page.', 'error');
});

// Performance monitoring
let performanceMetrics = {
    bookingsReceived: 0,
    averageRenderTime: 0,
    connectionUptime: 0
};

socket.on('new-booking', () => {
    performanceMetrics.bookingsReceived++;
});

// Log performance metrics every 5 minutes (for debugging)
setInterval(() => {
    console.log('📊 Performance Metrics:', performanceMetrics);
}, 300000);