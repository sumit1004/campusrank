// Load environment variables early
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import database connection pool
const db = require('./config/db');

// Import basic error handling middleware
const { errorHandler } = require('./middlewares/errorMiddleware');

// Import auth routes and middlewares
const authRoutes = require('./routes/authRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const adminRoutes = require('./routes/adminRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const { protect, authorize } = require('./middlewares/authMiddleware');

// Initialize the Express app
const app = express();

// --- Middlewares ---
// Enable CORS for all routes (to allow requests from the frontend)
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Parse incoming URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Serve uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
// Basic test route returning text as requested
app.get('/api/test', (req, res) => {
  res.send('Backend running');
});

// Database health check (Optional, good for verifying the MySQL connection)
app.get('/api/db-check', async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS solution');
    res.json({ message: 'Database connected successfully!', solution: rows[0].solution });
  } catch (error) {
    // Forward the error to the error middleware
    next(error);
  }
});

// --- Auth Routes ---
app.use('/api/auth', authRoutes);

// --- Certificate Routes ---
app.use('/api/certificates', certificateRoutes);

// --- Admin Routes ---
app.use('/api/admin', adminRoutes);

// --- Clubs Routes ---
const clubsRoutes = require('./routes/clubsRoutes');
app.use('/api/clubs', clubsRoutes);

// --- Super Admin Routes ---
const superAdminRoutes = require('./routes/superAdminRoutes');
app.use('/api/superadmin', superAdminRoutes);

// --- Leaderboard Routes ---
app.use('/api/leaderboard', leaderboardRoutes);

// --- Notification Routes ---
app.use('/api/notifications', require('./routes/notificationRoutes'));

// --- Event Registration Form Routes ---
app.use('/api/forms', require('./routes/formRoutes'));

// --- Form Template Routes ---
app.use('/api/templates', require('./routes/templateRoutes'));

// --- Protected Routes ---
// This test route requires a valid token attached to the "Authorization" header
app.get('/api/protected', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the protected route!',
    user: req.user // The decoded JWT payload attached directly by authMiddleware
  });
});

// Example of an Admin-only route demonstrating the `authorize` role middleware
app.get('/api/admin-only', protect, authorize('admin', 'superadmin'), (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed an admin-level route!',
    user: req.user
  });
});

// --- Error Handling Middleware ---
// This must be registered after all route definitions
app.use(errorHandler);

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
