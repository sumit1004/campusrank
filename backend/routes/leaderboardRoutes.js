const express = require('express');
const router = express.Router();

const {
  getGlobalLeaderboard,
  getClubLeaderboard
} = require('../controllers/leaderboardController');
const { optionalProtect } = require('../middlewares/authMiddleware');

// GET /api/leaderboard
router.get('/', optionalProtect, getGlobalLeaderboard);

// GET /api/leaderboard/club/:clubId
router.get('/club/:clubId', optionalProtect, getClubLeaderboard);

module.exports = router;
