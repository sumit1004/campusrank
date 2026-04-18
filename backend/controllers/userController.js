const db = require('../config/db');

/**
 * @desc    Get user profile data for dashboard
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Basic User Info
    const [userRows] = await db.query(
      'SELECT id, name, erp, email, branch, semester, role FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = userRows[0];

    // 2. REAL-TIME Total Points (Calculated from participation registry)
    const [pointsRows] = await db.query(
      'SELECT SUM(points) as total FROM event_participation WHERE user_id = ?',
      [userId]
    );
    const total_points = parseInt(pointsRows[0].total) || 0;

    // 3. Calculate Rank (University-wide)
    const [rankRows] = await db.query(
      'SELECT COUNT(*) + 1 AS `rank` FROM users WHERE total_points > ? AND role = "student"',
      [total_points]
    );
    const rank = rankRows[0].rank;

    // 4. Certificates List (Unified Approved Only)
    const [manualApproved] = await db.query(
      'SELECT id, event_name, position, points, file_url as url, "manual" as source, created_at FROM certificates WHERE user_id = ? AND status = "approved"',
      [userId]
    );

    const [eCerts] = await db.query(
      'SELECT id, event_name, position, points, certificate_url as url, "e_certificate" as source, created_at FROM e_certificates WHERE user_id = ?',
      [userId]
    );

    const certificates = [...manualApproved, ...eCerts].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // 5. Monthly Stats for Graph
    const [monthlyStats] = await db.query(`
      SELECT 
        MONTHNAME(event_date) as month, 
        CAST(SUM(points) AS SIGNED) as points 
      FROM event_participation 
      WHERE user_id = ? 
      GROUP BY MONTH(event_date), MONTHNAME(event_date)
      ORDER BY MONTH(event_date)
    `, [userId]);

    // Extra data for existing frontend components
    const [manualHistory] = await db.query(
      `SELECT c.*, cl.name as club_name 
       FROM certificates c
       LEFT JOIN clubs cl ON c.club_id = cl.id
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const [counts] = await db.query(
      `SELECT 
        (SELECT COUNT(*) FROM event_participation WHERE user_id = ?) as approvedCount,
        (SELECT COUNT(*) FROM certificates WHERE user_id = ? AND status = 'pending') as pendingCount,
        (SELECT COUNT(*) FROM e_certificates WHERE user_id = ?) as eCertsCount
      `,
      [userId, userId, userId]
    );

    const { approvedCount, pendingCount, eCertsCount } = counts[0];

    const [activityLogs] = await db.query(
      'SELECT action_type, metadata, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: {
        user: { ...user, total_points },
        total_points, // Ensure top level as requested too
        rank,
        certificates,
        monthly_stats: monthlyStats, // Alias for requested name
        monthlyStats,
        approvedCount,
        pendingCount,
        eCertsCount,
        activityLogs,
        manualHistory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (branch/semester)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { branch, semester } = req.body;
    const userId = req.user.id;

    await db.query(
      'UPDATE users SET branch = ?, semester = ? WHERE id = ?',
      [branch, semester, userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile
};
