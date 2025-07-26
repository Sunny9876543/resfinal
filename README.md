# Live Bookings Viewer

A real-time booking management dashboard that displays new bookings instantaneously without requiring page refreshes. Built for venue administrators to monitor incoming bookings in real-time.

## Overview

This full-stack web application establishes seamless connection and data flow between backend and frontend, utilizing Socket.IO for real-time communication. New bookings are generated every 5 seconds and immediately broadcast to all connected clients, appearing at the top of the booking list.

## Tech Stack

- **Backend**: Node.js with Express.js and Socket.IO
- **Frontend**: Standard HTML, CSS, and JavaScript (no React)
- **Database**: In-memory array on the server
- **Real-Time Communication**: Socket.IO for instant updates

## Requirements

- Node.js (version 16.0.0 or higher)
- npm (comes with Node.js)
- Modern web browser with JavaScript enabled

## Installation

1. **Clone or download this repository**
   ```bash
   git clone <your-repository-url>
   cd live-bookings-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This will install the following packages:
   - `express` - Web server framework
   - `socket.io` - Real-time bidirectional event-based communication
   - `cors` - Cross-Origin Resource Sharing middleware
   - `nodemon` - Development utility for auto-restarting the server

## Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

After starting the server, you will see output similar to:
```
🚀 Live Bookings Server running on port 3000
📊 Dashboard available at http://localhost:3000
⚡ Real-time updates enabled via Socket.IO
```

## Accessing the Application

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. The Live Bookings Viewer will load automatically
4. New bookings will start appearing every 5 seconds at the top of the list

## How It Works

### Backend Implementation

**Express Server Setup:**
- Fundamental Express server configured on port 3000
- Serves static files from the `public` directory
- Handles CORS for cross-origin requests

**Socket.IO Configuration:**
- Real-time communication established between server and clients
- Broadcasts new bookings to all connected clients
- Handles client connections and disconnections

**Mock Booking Generation:**
- Automated function runs every 5 seconds using `setInterval`
- Generates random booking objects with the exact structure: `{ venueName: "...", partySize: "...", time: "..." }`
- Additional fields added for enhanced functionality: `id`, `partyType`, `customerName`, `timestamp`, `status`
- Broadcasts each new booking via Socket.IO's "new-booking" event

### Frontend Implementation

**Single HTML Page:**
- Complete dashboard interface in `public/index.html`
- Responsive design with modern CSS styling
- No external frameworks - pure HTML, CSS, and JavaScript

**Socket.IO Client Integration:**
- Socket.IO client library integrated via CDN
- Establishes connection with the backend server
- Listens for real-time events from the server

**Real-Time Booking Display:**
- Listens for "new-booking" events from the server
- Dynamically creates new `<div>` elements for each booking
- New bookings appear at the top of the list without page refresh
- Displays booking details: venue name, party size, and time

## Core Features

### Real-Time Updates
- New bookings appear automatically every 5 seconds
- No manual refresh required
- Instant updates via Socket.IO communication
- Connection status indicator shows real-time connectivity

### Booking Management
- View all incoming bookings in real-time
- Confirm or decline pending bookings
- Filter bookings by status (All, Pending, Confirmed, Declined)
- Search functionality across venues, events, and customers
- Filter by party size categories

### Live Statistics
- Real-time counters for total, pending, confirmed, and declined bookings
- Connection status monitoring
- Server uptime tracking

## File Structure

```
live-bookings-viewer/
├── server.js              # Main server with Express and Socket.IO
├── package.json           # Project dependencies and scripts
├── README.md             # This documentation file
└── public/               # Frontend files
    ├── index.html        # Single HTML page
    ├── styles.css        # CSS styling
    └── script.js         # JavaScript with Socket.IO client
```

## Technical Implementation Details

### Backend Socket.IO Events
- `new-booking` - Broadcasts new booking to all connected clients
- `initial-bookings` - Sends existing bookings to newly connected clients
- `booking-updated` - Notifies clients of booking status changes
- `booking-stats` - Sends real-time statistics updates

### Frontend Socket.IO Events
- Listens for `new-booking` events
- Handles `initial-bookings` for data synchronization
- Processes `booking-updated` for real-time status changes
- Receives `booking-stats` for dashboard statistics

### Mock Booking Object Structure
Each generated booking contains:
```javascript
{
  venueName: "Random venue name",
  partySize: "Random number as string",
  time: "Formatted date/time string",
  id: "Unique booking identifier",
  partyType: "Event type",
  customerName: "Customer name",
  timestamp: "ISO timestamp",
  status: "pending"
}
```

## API Endpoints

- `GET /` - Serves the main dashboard page
- `GET /api/bookings` - Returns all bookings in JSON format
- `GET /api/stats` - Returns booking statistics
- `GET /api/health` - Server health check endpoint

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Common Issues

**Server won't start:**
- Ensure Node.js is installed (version 16.0.0+)
- Run `npm install` to install dependencies
- Check if port 3000 is available

**No bookings appearing:**
- Verify browser console for errors (press F12)
- Check connection status indicator on the dashboard
- Ensure JavaScript is enabled in your browser

**Connection issues:**
- Confirm server is running on `http://localhost:3000`
- Check firewall settings
- Try refreshing the browser page

## Development Notes

The application demonstrates:
- **Full-Stack Integration**: Seamless data flow between Node.js backend and vanilla JavaScript frontend
- **Real-Time Logic**: Accurate Socket.IO implementation for instant updates
- **Problem Solving**: Proper configuration of both client-side and server-side environments

## License

MIT License - Free to use and modify for your venue management needs.

---

**Perfect for venue administrators who need real-time booking monitoring without page refreshes.**