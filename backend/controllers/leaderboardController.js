const db = require('../config/db');

/**
 * @desc    Get leaderboard (overall or club-wise) with time filters
 * @route   GET /api/leaderboard
 * @access  Public
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const { type, club_id, filter = 'overall' } = req.query;
    
    const cid = (type === 'club' && club_id) ? club_id : 0;
    
    // Safety check for filter
    const validFilters = ['overall', 'monthly', 'yearly'];
    const activeFilter = validFilters.includes(filter) ? filter : 'overall';

    let query = '';
    let params = [];

    if (activeFilter === 'monthly') {
      query = `
        SELECT users.id, users.name, users.erp, lc.total_points
        FROM leaderboard_cache lc
        JOIN users ON lc.user_id = users.id
        WHERE lc.club_id = ? 
        AND lc.month = MONTH(CURRENT_DATE()) 
        AND lc.year = YEAR(CURRENT_DATE())
        ORDER BY lc.total_points DESC
        LIMIT 50
      `;
      params = [cid];
    } else if (activeFilter === 'yearly') {
      query = `
        SELECT users.id, users.name, users.erp, SUM(lc.total_points) as total_points
        FROM leaderboard_cache lc
        JOIN users ON lc.user_id = users.id
        WHERE lc.club_id = ? 
        AND lc.year = YEAR(CURRENT_DATE())
        GROUP BY users.id
        ORDER BY total_points DESC
        LIMIT 50
      `;
      params = [cid];
    } else {
      // Overall
      query = `
        SELECT users.id, users.name, users.erp, SUM(lc.total_points) as total_points
        FROM leaderboard_cache lc
        JOIN users ON lc.user_id = users.id
        WHERE lc.club_id = ?
        GROUP BY users.id
        ORDER BY total_points DESC
        LIMIT 50
      `;
      params = [cid];
    }

    const [rows] = await db.query(query, params);
    
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

