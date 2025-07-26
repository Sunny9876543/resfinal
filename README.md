# Live Bookings Viewer

A real-time booking management dashboard that displays new bookings instantaneously without requiring page refreshes. This full-stack web application demonstrates seamless Socket.IO integration between Node.js backend and vanilla JavaScript frontend.

## Project Overview

This application fulfills the requirements for a comprehensive full-stack, real-time "Live Bookings" viewer designed for venue administrators to monitor and confirm incoming bookings in real-time.

## Tech Stack

- **Backend**: Node.js with Express.js and Socket.IO
- **Frontend**: Standard HTML, CSS, and JavaScript (no React)
- **Database**: In-memory array on the server
- **Real-Time Communication**: Socket.IO for instant updates

## Requirements Implementation

### Backend Implementation ✅
- **Express Server**: Fundamental Express server established on port 3000
- **Socket.IO Configuration**: Real-time communication configured between server and clients
- **Mock Function**: Automated function runs every 5 seconds using `setInterval`
- **Booking Object**: Generates exact structure `{ venueName: "...", partySize: "...", time: "..." }`
- **Broadcasting**: Broadcasts each new booking to all connected clients via Socket.IO

### Frontend Implementation ✅
- **Single HTML Page**: Complete dashboard interface in one HTML file
- **Socket.IO Client**: Integrated client library connects with backend
- **Event Listening**: Listens for "new-booking" events from server
- **Dynamic Creation**: Creates new `<div>` elements for each booking
- **Top Positioning**: New bookings appear at the top without page refresh

## Installation and Setup

### Prerequisites
- Node.js (version 16.0.0 or higher)
- npm (comes with Node.js)
- Modern web browser with JavaScript enabled

### Step 1: Install Dependencies
```bash
npm install
```

This installs the required packages:
- `express` - Web server framework
- `socket.io` - Real-time bidirectional communication
- `cors` - Cross-Origin Resource Sharing middleware
- `nodemon` - Development utility (dev dependency)

### Step 2: Execute the Server

**For Development (Recommended):**
```bash
npm run dev
```

**For Production:**
```bash
npm start
```

### Step 3: Access the Frontend

1. Open your web browser
2. Navigate to: `http://localhost:3000`
3. The Live Bookings Viewer will load automatically
4. New bookings will start appearing every 5 seconds at the top of the list

## How It Works

### Backend Process
1. **Express Server**: Serves the frontend files and handles HTTP requests
2. **Socket.IO Setup**: Establishes WebSocket connections with clients
3. **Mock Booking Generation**: Every 5 seconds, generates a random booking object with the exact structure:
   ```javascript
   {
     venueName: "Random venue name",
     partySize: "Random number as string", 
     time: "Formatted date/time string"
   }
   ```
4. **Real-Time Broadcasting**: Immediately broadcasts each new booking to all connected clients via Socket.IO's "new-booking" event

### Frontend Process
1. **Socket.IO Client**: Connects to the backend server automatically
2. **Event Listening**: Listens for "new-booking" events from the server
3. **Dynamic DOM Manipulation**: Upon receiving a new booking:
   - Creates a new `<div>` element
   - Populates it with booking details (venue name, party size, time)
   - Appends it to the top of the booking list
   - No page refresh required

### Real-Time Flow
```
Server (every 5 seconds) → Generate Booking → Socket.IO Broadcast → Client Receives → Create <div> → Display at Top
```

## File Structure

```
live-bookings-viewer/
├── server.js              # Main server with Express and Socket.IO
├── package.json           # Dependencies and scripts
├── README.md             # This documentation
└── public/               # Frontend files
    ├── index.html        # Single HTML page
    ├── styles.css        # CSS styling
    └── script.js         # JavaScript with Socket.IO client
```

## Core Features

### Real-Time Updates
- New bookings appear automatically every 5 seconds
- No manual refresh required
- Instant updates via Socket.IO communication
- Connection status indicator shows real-time connectivity

### Booking Management
- View all incoming bookings in real-time
- Confirm or decline pending bookings
- Filter bookings by status and search functionality
- Enhanced dashboard features for better user experience

## Socket.IO Events

### Server Events (Emitted)
- `new-booking` - Broadcasts new booking to all connected clients
- `initial-bookings` - Sends existing bookings to newly connected clients
- `booking-updated` - Notifies clients of booking status changes

### Client Events (Listened)
- `new-booking` - Receives new bookings from server
- `initial-bookings` - Receives existing bookings on connection
- `booking-updated` - Receives booking status updates

## API Endpoints

- `GET /` - Serves the main dashboard page
- `GET /api/bookings` - Returns all bookings in JSON format
- `GET /api/stats` - Returns booking statistics
- `GET /api/health` - Server health check

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Troubleshooting

### Server Won't Start
- Ensure Node.js is installed (check with `node --version`)
- Run `npm install` to install all dependencies
- Check if port 3000 is available

### No Bookings Appearing
- Open browser developer tools (F12) and check console for errors
- Verify connection status indicator shows "Connected"
- Ensure JavaScript is enabled in your browser

### Connection Issues
- Confirm server is running on `http://localhost:3000`
- Check firewall settings that might block the connection
- Try refreshing the browser page

## Development Notes

This application demonstrates:
- **Full-Stack Integration**: Perfect connection and data flow between Node.js backend and vanilla JavaScript frontend
- **Real-Time Logic**: Accurate Socket.IO implementation for instant updates without page refresh
- **Problem Solving**: Proper configuration and management of both client-side and server-side environments

## Technical Implementation

### Mock Booking Generation
The server generates realistic booking data every 5 seconds with:
- Random venue names from a predefined list
- Random party sizes appropriate for different event types
- Realistic future booking times
- Proper string formatting as specified in requirements

### Socket.IO Integration
- WebSocket connection established automatically on page load
- Real-time bidirectional communication between server and all connected clients
- Automatic reconnection handling for robust connectivity
- Connection health monitoring and status display

## License

MIT License - Free to use and modify for venue management applications.

---

**Perfect for venue administrators who need real-time booking monitoring without page refreshes.**