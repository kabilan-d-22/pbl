const express = require('express');
const router = express.Router();
const { askGemini } = require('../controllers/aiController');
const { auth, requireHead } = require('../middleware/auth');

// Only Heads can access this route
router.post('/ask', auth, requireHead, askGemini);

module.exports = router;