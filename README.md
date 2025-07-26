# Live Bookings Viewer

A real-time booking management dashboard for venue administrators to monitor and confirm incoming bookings instantly.

## Overview

This full-stack web application displays new bookings in real-time without requiring page refreshes. Administrators can view booking details as they arrive and manage them through an intuitive interface.

## Tech Stack

- **Backend**: Node.js with Express.js and Socket.IO
- **Frontend**: HTML, CSS, and JavaScript (vanilla - no React)
- **Database**: In-memory array on the server

## Requirements

- Node.js (version 16.0.0 or higher)
- npm (comes with Node.js)
- Modern web browser

## Installation

1. **Clone or download this project**
   ```bash
   git clone <repository-url>
   cd live-bookings-viewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   This installs:
   - express (web server framework)
   - socket.io (real-time communication)
   - cors (cross-origin resource sharing)
   - nodemon (development tool)

## Running the Application

### Development Mode (Recommended)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

After starting, you'll see:
```
🚀 Live Bookings Server running on port 3000
📊 Dashboard available at http://localhost:3000
⚡ Real-time updates enabled via Socket.IO
```

## Accessing the Dashboard

1. Open your web browser
2. Go to: `http://localhost:3000`
3. The dashboard will load and start receiving bookings automatically

## How It Works

### Backend Functionality
- **Express Server**: Serves the frontend and handles HTTP requests
- **Socket.IO**: Manages real-time communication between server and clients
- **Mock Booking Generator**: Creates random booking objects every 5 seconds with:
  - `venueName`: Random venue name
  - `partySize`: Random party size (as string)
  - `time`: Random future date/time
- **Broadcasting**: Sends new bookings to all connected clients via Socket.IO

### Frontend Functionality
- **Single HTML Page**: Complete dashboard interface
- **Socket.IO Client**: Connects to backend for real-time updates
- **Event Listening**: Listens for "new-booking" events from server
- **Dynamic Updates**: Creates new `<div>` elements for each booking
- **Top Insertion**: New bookings appear at the top of the list without page refresh

## Core Features

### Real-Time Booking Display
- New bookings appear automatically every 5 seconds
- No page refresh required
- Bookings display at the top of the list
- Each booking shows venue name, party size, and time

### Booking Management
- Confirm pending bookings (blue notification)
- Decline pending bookings (red notification)
- View detailed booking information
- Filter bookings by status and other criteria

### Live Statistics
- Total bookings counter
- Pending bookings count
- Confirmed bookings count
- Declined bookings count

## File Structure

```
live-bookings-viewer/
├── server.js              # Main server with Express and Socket.IO
├── package.json           # Project configuration and dependencies
├── README.md             # This documentation
└── public/               # Frontend files
    ├── index.html        # Single HTML page
    ├── styles.css        # CSS styling
    └── script.js         # JavaScript with Socket.IO client
```

## API Endpoints

- `GET /` - Main dashboard page
- `GET /api/bookings` - Retrieve all bookings (JSON)
- `GET /api/stats` - Get booking statistics (JSON)
- `GET /api/health` - Server health check (JSON)

## Socket.IO Events

### Server to Client
- `new-booking` - Broadcasts new booking to all clients
- `booking-updated` - Notifies clients of booking status changes
- `initial-bookings` - Sends existing bookings to new clients

### Client to Server
- `confirm-booking` - Request to confirm a booking
- `decline-booking` - Request to decline a booking

## Troubleshooting

### Common Issues

**"Cannot find module" error:**
- Run `npm install` in the project directory
- Make sure you're in the correct folder

**"Port 3000 already in use":**
- Stop other applications using port 3000
- Or change the port in server.js

**Bookings not appearing:**
- Check browser console for errors (F12)
- Verify connection status shows "Connected"
- Try refreshing the page

**Connection problems:**
- Make sure the server is running
- Check that you're accessing `http://localhost:3000`
- Disable browser extensions that might interfere

## Development Notes

### Key Implementation Details

**Mock Booking Generation:**
```javascript
setInterval(() => {
  const newBooking = generateMockBooking();
  io.emit('new-booking', newBooking);
}, 5000); // Every 5 seconds
```

**Frontend Event Handling:**
```javascript
socket.on('new-booking', (booking) => {
  // Create new div element
  const bookingDiv = createBookingCard(booking);
  // Add to top of list
  bookingsList.insertBefore(bookingDiv, bookingsList.firstChild);
});
```

### Data Flow
1. Server generates mock booking every 5 seconds
2. Server broadcasts booking via Socket.IO
3. All connected clients receive the booking
4. Frontend creates new DOM element
5. New booking appears at top of list instantly

## Browser Compatibility

Works on all modern browsers:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

MIT License - Feel free to use and modify for your venue management needs.

---

**Built for venue administrators who need real-time booking management.**