const express = require('express');
const router = express.Router();
const { sendNotification, getMyNotifications } = require('../controllers/notificationController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Base path: /api/notifications

// GET /api/notifications - Get user specific notifications
router.get('/', protect, getMyNotifications);

// POST /api/notifications/send - SuperAdmin only
router.post('/send', protect, authorize('superadmin'), sendNotification);

module.exports = router;
