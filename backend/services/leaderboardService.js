const db = require('../config/db');

/**
 * Get leaderboard data computed live from event_participation.
 * @param {'global'|'club'} type
 * @param {number|null} club_id
 * @param {'overall'|'monthly'|'yearly'} filter
 * @param {number} page
 * @param {number} limit
 */
const getLeaderboardData = async (type, club_id, filter, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  let params = [];
  
  let baseQuery = `
    FROM event_participation ep
    JOIN users u ON u.id = ep.user_id
  `;

  let whereClauses = [`u.role = 'student'`];
  
  if (type === 'club' && club_id && club_id !== '0') {
    whereClauses.push(`ep.club_id = ?`);
    params.push(club_id);
  }

  if (filter === 'monthly') {
    whereClauses.push(`MONTH(ep.event_date) = MONTH(CURRENT_DATE()) AND YEAR(ep.event_date) = YEAR(CURRENT_DATE())`);
  } else if (filter === 'yearly') {
    whereClauses.push(`YEAR(ep.event_date) = YEAR(CURRENT_DATE())`);
  }

  const whereStr = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

  const query = `
    SELECT u.id, u.name, u.erp, u.avatar_url, SUM(ep.points) as total_points
    ${baseQuery}
    ${whereStr}
    GROUP BY u.id
    ORDER BY total_points DESC, u.id ASC
    LIMIT ? OFFSET ?
  `;
  
  const countQuery = `
    SELECT COUNT(DISTINCT ep.user_id) as total
    ${baseQuery}
    ${whereStr}
  `;

  const [rows] = await db.query(query, [...params, parseInt(limit), parseInt(offset)]);
  const [countResult] = await db.query(countQuery, params);

  return {
    data: rows.map((row, index) => ({
      rank: offset + index + 1,
      ...row,
      total_points: parseInt(row.total_points) || 0
    })),
    total: countResult[0].total
  };
};

module.exports = { getLeaderboardData };
