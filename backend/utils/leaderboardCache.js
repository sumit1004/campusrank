const db = require('../config/db');

/**
 * @desc    Incrementally update leaderboard cache for a user
 * @param   {number} userId - ID of the user
 * @param   {number} clubId - ID of the club
 * @param   {number} points - Points to add
 * @param   {string} eventDate - Date of the event (YYYY-MM-DD)
 */
const updateLeaderboardCache = async (userId, clubId, points, eventDate) => {
  try {
    const query = `
      INSERT INTO leaderboard_cache 
      (user_id, club_id, total_points, month, year)
      VALUES (?, ?, ?, MONTH(?), YEAR(?))
      ON DUPLICATE KEY UPDATE
      total_points = total_points + VALUES(total_points),
      updated_at = CURRENT_TIMESTAMP
    `;
    
    // Passing eventDate twice because of MONTH(?) and YEAR(?) placeholders
    
    // 1. Update Specific Club Cache
    await db.query(query, [userId, clubId, points, eventDate, eventDate]);

    // 2. Update University-Wide Cache (club_id = 0)
    await db.query(query, [userId, 0, points, eventDate, eventDate]);
    
  } catch (error) {
    console.error('Leaderboard Cache Update Error:', error);
  }
};

module.exports = { updateLeaderboardCache };
