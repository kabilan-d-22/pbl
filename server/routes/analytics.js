const express = require('express');
const { getTeamAnalytics, getUserAnalytics } = require('../controllers/analyticsController');
const { auth, requireHead } = require('../middleware/auth');

const router = express.Router();

// Route for team-wide analytics (requires Head role)
router.get('/team', auth, requireHead, getTeamAnalytics);

// Fix: Define two routes to handle optional userId instead of using ":userId?"
// This route handles analytics for a specific user ID
router.get('/user/:userId', auth, getUserAnalytics);

// This route handles analytics for the currently logged-in user
router.get('/user', auth, getUserAnalytics);

module.exports = router;