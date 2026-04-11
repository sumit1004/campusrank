const db = require('../config/db');

/**
 * @desc    Get global leaderboard
 * @route   GET /api/leaderboard
 * @access  Public
 */
const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { search } = req.query;
    const loggedInUserId = req.user ? req.user.id : null;

    // 1. Fetch all students to calculate global ranks
    // Using COALESCE to ensure total_points is never NULL
    const query = `
      SELECT id, name, erp, COALESCE(total_points, 0) as total_points 
      FROM users 
      WHERE role = 'student'
      ORDER BY total_points DESC, name ASC
    `;

    const [users] = await db.query(query);

    // 2. Add ranking number to each user object
    const fullLeaderboard = users.map((user, index) => ({
      rank: index + 1,
      ...user,
      total_points: Number(user.total_points) // Ensure it is a number
    }));

    // 3. Find logged in user's stats if applicable
    let currentUserStats = null;
    if (loggedInUserId) {
      currentUserStats = fullLeaderboard.find(u => u.id === loggedInUserId) || null;
    }

    // 4. Apply search or top 10 limit
    let filteredData = [];
    if (search && search.trim() !== "") {
      const s = search.toLowerCase().trim();
      filteredData = fullLeaderboard.filter(u => 
        u.name.toLowerCase().includes(s) || 
        u.erp.toLowerCase().includes(s)
      );
    } else {
      // Return only top 10 by default
      filteredData = fullLeaderboard.slice(0, 10);
    }

    // 5. Return the payload
    res.status(200).json({
      success: true,
      count: filteredData.length,
      data: filteredData,
      currentUser: currentUserStats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get club-specific leaderboard
 * @route   GET /api/leaderboard/club/:clubId
 * @access  Public
 */
const getClubLeaderboard = async (req, res, next) => {
  try {
    const clubId = req.params.clubId;
    const { search } = req.query;

    // 1. Join users with certificates, filtering by club_id and approved status
    const query = `
      SELECT u.id, u.name, u.erp, COALESCE(SUM(c.points), 0) as total_points
      FROM users u
      LEFT JOIN certificates c ON u.id = c.user_id AND c.club_id = ? AND c.status = 'approved'
      WHERE u.role = 'student'
      GROUP BY u.id
      ORDER BY total_points DESC, u.name ASC
    `;

    const [users] = await db.query(query, [clubId]);

    // 2. Process leaderboard with ranks
    const fullLeaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      erp: user.erp,
      total_points: Number(user.total_points) 
    }));

    // 3. Filter/Limit
    let filteredData = [];
    if (search && search.trim() !== "") {
      const s = search.toLowerCase().trim();
      filteredData = fullLeaderboard.filter(u => 
        u.name.toLowerCase().includes(s) || 
        u.erp.toLowerCase().includes(s)
      );
    } else {
      filteredData = fullLeaderboard.slice(0, 10);
    }

    // 4. Return payload
    res.status(200).json({
      success: true,
      club_id: clubId,
      count: filteredData.length,
      data: filteredData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGlobalLeaderboard,
  getClubLeaderboard
};
