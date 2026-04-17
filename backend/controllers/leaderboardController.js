const db = require('../config/db');

/**
 * @desc    Get leaderboard (overall or club-wise) with time filters
 * @route   GET /api/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { type, club_id, filter } = req.query;
    
    let filterCondition = '';
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (filter === 'monthly') {
      filterCondition = ` AND MONTH(event_participation.created_at) = ${currentMonth} AND YEAR(event_participation.created_at) = ${currentYear}`;
    } else if (filter === 'yearly') {
      filterCondition = ` AND YEAR(event_participation.created_at) = ${currentYear}`;
    }

    let query = '';
    let queryParams = [];

    if (type === 'club') {
      if (!club_id) {
        return res.status(400).json({ success: false, message: 'club_id is required for type=club' });
      }
      query = `
        SELECT 
          users.id,
          users.name,
          users.erp,
          SUM(event_participation.points) AS total_points
        FROM event_participation
        JOIN users ON event_participation.user_id = users.id
        WHERE event_participation.club_id = ?
        ${filterCondition}
        GROUP BY users.id
        ORDER BY total_points DESC
        LIMIT 50;
      `;
      queryParams = [club_id];
    } else {
      // Overall Leaderboard (type = overall or default)
      query = `
        SELECT 
          users.id,
          users.name,
          users.erp,
          SUM(event_participation.points) AS total_points
        FROM event_participation
        JOIN users ON event_participation.user_id = users.id
        WHERE 1=1
        ${filterCondition}
        GROUP BY users.id
        ORDER BY total_points DESC
        LIMIT 50;
      `;
    }

    const [rows] = await db.query(query, queryParams);
    
    // Add rank and ensure total_points is a number
    const data = rows.map((row, index) => ({
      rank: index + 1,
      ...row,
      total_points: parseInt(row.total_points) || 0
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard
};

