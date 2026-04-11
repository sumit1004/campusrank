const db = require('../config/db');

/**
 * @desc    Send notification (Superadmin only)
 * @route   POST /api/notifications/send
 * @access  Private/SuperAdmin
 */
exports.sendNotification = async (req, res, next) => {
  try {
    const { title, message, target_type, erp } = req.body;

    if (!title || !message || !target_type) {
      return res.status(400).json({ success: false, message: 'Please provide title, message and target type' });
    }

    let user_id = null;

    if (target_type === 'single_user') {
      if (!erp) {
        return res.status(400).json({ success: false, message: 'ERP is required for single user target' });
      }
      const [users] = await db.query('SELECT id FROM users WHERE erp = ?', [erp]);
      if (users.length === 0) {
        return res.status(404).json({ success: false, message: 'User with this ERP not found' });
      }
      user_id = users[0].id;
    }

    await db.query(
      'INSERT INTO notifications (title, message, target_type, user_id) VALUES (?, ?, ?, ?)',
      [title, message, target_type, user_id]
    );

    res.status(201).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getMyNotifications = async (req, res, next) => {
  try {
    const { id, role } = req.user;

    // Logic:
    // target_type = 'all_students' AND role = 'student'
    // OR target_type = 'all_admins' AND role = 'admin'
    // OR user_id = current user id
    
    // Also include those sent to ALL admins if the user is a superadmin? 
    // Usually superadmins see everything or nothing specific. Let's include admin ones for superadmin too.

    const query = `
      SELECT * FROM notifications 
      WHERE 
        (target_type = 'all_students' AND ? = 'student') OR
        (target_type = 'all_admins' AND (? = 'admin' OR ? = 'superadmin')) OR
        (user_id = ?)
      ORDER BY created_at DESC
    `;

    const [notifications] = await db.query(query, [role, role, role, id]);

    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};
