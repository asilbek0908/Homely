const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
require('dotenv').config();

// Ensure upload directories exist
['uploads/avatars', 'uploads/documents'].forEach((dir) => {
  const full = path.join(__dirname, dir);
  if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
});

const authRoutes = require('./routes/auth.routes');
const workerRoutes = require('./routes/worker.routes');
const bookingRoutes = require('./routes/booking.routes');
const reviewRoutes = require('./routes/review.routes');
const adminRoutes = require('./routes/admin.routes');
const telegramRoutes = require('./routes/telegram.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/telegram', telegramRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Homely API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', credentials: true },
});

// Socket.IO connection handling
const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  socket.on('register', (userId) => {
    if (userId) {
      userSockets.set(userId, socket.id);
      socket.userId = userId;
    }
  });

  socket.on('disconnect', () => {
    if (socket.userId) userSockets.delete(socket.userId);
  });
});

// Make io accessible to routes via app
app.set('io', io);
app.set('userSockets', userSockets);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
