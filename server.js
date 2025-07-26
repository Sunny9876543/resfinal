const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

// Enhanced server configuration for robust full-stack integration
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  // Enhanced Socket.IO configuration for better real-time performance
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Enhanced middleware for full-stack integration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add request logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory storage for bookings
let bookings = [];
let bookingIdCounter = 1;
let connectedClients = 0;

// Performance monitoring for problem-solving
let performanceStats = {
  totalBookingsGenerated: 0,
  totalConnections: 0,
  averageResponseTime: 0,
  lastBookingTime: null,
  serverStartTime: new Date()
};

// Mock venue data for realistic bookings
const venues = [
  'The Grand Ballroom', 'Sunset Terrace', 'Garden Pavilion', 'Crystal Hall',
  'Rooftop Lounge', 'Marina View', 'Heritage Hall', 'Sky Deck',
  'Vineyard Room', 'Coastal Club', 'Metropolitan Suite', 'Riverside Pavilion',
  'Golden Gate Hall', 'Oceanfront Terrace', 'Downtown Loft', 'Historic Manor',
  'Azure Banquet Hall', 'Emerald Gardens', 'Platinum Pavilion', 'Diamond Terrace',
  'Sapphire Lounge', 'Ruby Conference Center', 'Pearl Event Space', 'Opal Ballroom',
  'Topaz Meeting Hall', 'Amber Reception Room', 'Jade Garden Venue', 'Onyx Event Center'
];

const eventTypes = [
  'Wedding Reception', 'Corporate Meeting', 'Birthday Party', 'Anniversary Celebration',
  'Business Conference', 'Product Launch', 'Graduation Party', 'Retirement Celebration',
  'Holiday Party', 'Team Building Event', 'Charity Gala', 'Art Exhibition',
  'Wine Tasting', 'Networking Event', 'Awards Ceremony', 'Fashion Show',
  'Book Launch', 'Fundraising Dinner', 'Cultural Festival', 'Music Concert',
  'Dance Performance', 'Comedy Show', 'Cooking Class', 'Workshop Seminar',
  'Trade Show', 'Job Fair', 'Health & Wellness Fair', 'Technology Summit',
  'Educational Workshop', 'Community Meeting', 'Sports Banquet', 'Reunion Party'
];

const customerNames = [
  'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson', 'Jessica Williams',
  'Robert Anderson', 'Amanda Davis', 'Christopher Lee', 'Michelle Brown', 'Daniel Wilson',
  'Ashley Garcia', 'Matthew Martinez', 'Lauren Taylor', 'Kevin Moore', 'Stephanie Jackson',
  'Brandon White', 'Nicole Harris', 'Justin Clark', 'Rachel Lewis', 'Tyler Robinson',
  'Samantha Walker', 'Jonathan Hall', 'Megan Allen', 'Ryan Young', 'Brittany King',
  'Alexander Wright', 'Danielle Lopez', 'Nicholas Hill', 'Kimberly Scott', 'Andrew Green'
];

// Track used combinations to prevent repeats
let usedCombinations = new Set();

// Generate unique combination key
function getCombinationKey(venue, eventType, customerName) {
  return `${venue}-${eventType}-${customerName}`;
}

// Reset used combinations when we've used most possibilities
function resetUsedCombinationsIfNeeded() {
  const totalPossibleCombinations = venues.length * eventTypes.length * customerNames.length;
  if (usedCombinations.size > totalPossibleCombinations * 0.8) {
    usedCombinations.clear();
    console.log('🔄 Reset used combinations to ensure variety');
  }
}
// Generate realistic booking times
function generateBookingTime() {
  const now = new Date();
  const futureTime = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Next 30 days
  const hours = Math.floor(Math.random() * 12) + 12; // 12 PM to 11 PM
  const minutes = Math.random() < 0.5 ? 0 : 30; // :00 or :30
  
  futureTime.setHours(hours, minutes, 0, 0);
  
  return futureTime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Generate mock booking
function generateMockBooking() {
  resetUsedCombinationsIfNeeded();
  
  let venue, eventType, customerName, combinationKey;
  let attempts = 0;
  const maxAttempts = 50;
  
  // Find a unique combination
  do {
    venue = venues[Math.floor(Math.random() * venues.length)];
    eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    combinationKey = getCombinationKey(venue, eventType, customerName);
    attempts++;
  } while (usedCombinations.has(combinationKey) && attempts < maxAttempts);
  
  // Mark this combination as used
  usedCombinations.add(combinationKey);
  
  // Generate party size based on event type
  let partySize;
  if (eventType.includes('Wedding') || eventType.includes('Gala') || eventType.includes('Conference')) {
    partySize = Math.floor(Math.random() * 100) + 50; // 50-150 for large events
  } else if (eventType.includes('Corporate') || eventType.includes('Meeting') || eventType.includes('Workshop')) {
    partySize = Math.floor(Math.random() * 30) + 10; // 10-40 for business events
  } else if (eventType.includes('Birthday') || eventType.includes('Anniversary') || eventType.includes('Party')) {
    partySize = Math.floor(Math.random() * 40) + 15; // 15-55 for parties
  } else {
    partySize = Math.floor(Math.random() * 60) + 20; // 20-80 for other events
  }
  
  const time = generateBookingTime();
  
  // Core booking object as specified in requirements
  const booking = {
    venueName: venue,
    partySize: partySize.toString(), // Convert to string as per requirements
    time: time,
    // Additional fields for enhanced functionality
    id: bookingIdCounter++,
    partyType: eventType,
    customerName: customerName,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  
  // Add to beginning of array (newest first)
  bookings.unshift(booking);
  
  // Keep only last 50 bookings to prevent memory issues
  if (bookings.length > 50) {
    bookings = bookings.slice(0, 50);
  }
  
  return booking;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  connectedClients++;
  performanceStats.totalConnections++;
  console.log(`✅ New client connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${connectedClients}`);
  
  // Enhanced initial data sync for full-stack integration
  socket.emit('initial-bookings', bookings);
  
  // Send comprehensive statistics for real-time dashboard
  socket.emit('booking-stats', {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    declinedBookings: bookings.filter(b => b.status === 'declined').length,
    connectedClients: connectedClients,
    serverUptime: Math.floor((new Date() - performanceStats.serverStartTime) / 1000)
  });
  
  // Enhanced disconnect handling for connection management
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`❌ Client disconnected: ${socket.id}`);
    console.log(`📊 Remaining connected clients: ${connectedClients}`);
  });
  
  // Enhanced booking confirmation with validation and error handling
  socket.on('confirm-booking', (bookingId) => {
    console.log(`📋 Confirmation request for booking #${bookingId} from ${socket.id}`);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      if (booking.status === 'pending') {
        booking.status = 'confirmed';
        booking.updatedAt = new Date().toISOString();
        booking.updatedBy = socket.id;
        
        // Broadcast to all clients for real-time updates
        io.emit('booking-updated', booking);
        
        // Send confirmation back to requesting client
        socket.emit('booking-action-success', {
          action: 'confirm',
          bookingId: bookingId,
          message: 'Booking confirmed successfully'
        });
        
        console.log(`✅ Booking #${bookingId} confirmed by ${socket.id}`);
      } else {
        socket.emit('booking-action-error', {
          action: 'confirm',
          bookingId: bookingId,
          message: 'Booking is not in pending status'
        });
      }
    } else {
      socket.emit('booking-action-error', {
        action: 'confirm',
        bookingId: bookingId,
        message: 'Booking not found'
      });
    }
  });
  
  // Enhanced booking decline with validation and error handling
  socket.on('decline-booking', (bookingId) => {
    console.log(`❌ Decline request for booking #${bookingId} from ${socket.id}`);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      if (booking.status === 'pending') {
        booking.status = 'declined';
        booking.updatedAt = new Date().toISOString();
        booking.updatedBy = socket.id;
        
        // Broadcast to all clients for real-time updates
        io.emit('booking-updated', booking);
        
        // Send confirmation back to requesting client
        socket.emit('booking-action-success', {
          action: 'decline',
          bookingId: bookingId,
          message: 'Booking declined successfully'
        });
        
        console.log(`❌ Booking #${bookingId} declined by ${socket.id}`);
      } else {
        socket.emit('booking-action-error', {
          action: 'decline',
          bookingId: bookingId,
          message: 'Booking is not in pending status'
        });
      }
    } else {
      socket.emit('booking-action-error', {
        action: 'decline',
        bookingId: bookingId,
        message: 'Booking not found'
      });
    }
  });
  
  // Handle client ping for connection health monitoring
  socket.on('client-ping', () => {
    socket.emit('server-pong', { timestamp: new Date().toISOString() });
  });
  
  // Handle client requesting server status
  socket.on('request-server-status', () => {
    socket.emit('server-status', {
      connectedClients: connectedClients,
      totalBookings: bookings.length,
      serverUptime: Math.floor((new Date() - performanceStats.serverStartTime) / 1000),
      lastBookingGenerated: performanceStats.lastBookingTime
    });
  });
});

// Enhanced API Routes for full-stack integration
app.get('/api/bookings', (req, res) => {
  const startTime = Date.now();
  
  res.json({
    success: true,
    bookings: bookings,
    total: bookings.length,
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime
  });
});

app.get('/api/stats', (req, res) => {
  const startTime = Date.now();
  
  res.json({
    success: true,
    stats: {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      declinedBookings: bookings.filter(b => b.status === 'declined').length,
      connectedClients: connectedClients,
      serverUptime: Math.floor((new Date() - performanceStats.serverStartTime) / 1000)
    },
    timestamp: new Date().toISOString(),
    responseTime: Date.now() - startTime
  });
});

// Health check endpoint for monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor((new Date() - performanceStats.serverStartTime) / 1000),
    connectedClients: connectedClients,
    totalBookings: bookings.length,
    memoryUsage: process.memoryUsage()
  });
});

// Enhanced mock booking generator with performance monitoring
setInterval(() => {
  const newBooking = generateMockBooking();
  performanceStats.totalBookingsGenerated++;
  performanceStats.lastBookingTime = new Date().toISOString();
  
  // Broadcast to all connected clients for real-time updates
  io.emit('new-booking', newBooking);
  
  // Broadcast updated statistics to all clients
  io.emit('booking-stats', {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
    declinedBookings: bookings.filter(b => b.status === 'declined').length,
    connectedClients: connectedClients,
    serverUptime: Math.floor((new Date() - performanceStats.serverStartTime) / 1000)
  });
  
  console.log(`🎉 New booking generated: ${newBooking.venueName} - ${newBooking.partyType} - Party of ${newBooking.partySize} (Total: ${performanceStats.totalBookingsGenerated})`);
}, 5000); // Generate new booking every 5 seconds as per requirements

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Live Bookings Server running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
  console.log(`⚡ Real-time updates enabled via Socket.IO`);
  console.log(`🔧 API endpoints available:`);
  console.log(`   - GET /api/bookings - Retrieve all bookings`);
  console.log(`   - GET /api/stats - Get booking statistics`);
  console.log(`   - GET /api/health - Server health check`);
  console.log(`🌐 Full-stack integration: Backend ↔ Frontend ↔ Real-time`);
  
  // Log server capabilities
  console.log(`📡 Socket.IO Events:`);
  console.log(`   - new-booking: Real-time booking creation`);
  console.log(`   - booking-updated: Real-time status updates`);
  console.log(`   - booking-stats: Live statistics updates`);
  console.log(`   - confirm-booking/decline-booking: User actions`);
});

// Enhanced error handling for production readiness
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});