const express = require('express');
const router = express.Router();
const { auth, requireHead } = require('../middleware/auth');
const { getMessages, sendMessage, deleteConversation } = require('../controllers/chatController');

router.get('/:otherUserId', auth, getMessages);
router.post('/send', auth, sendMessage);
router.delete('/:otherUserId', auth, requireHead, deleteConversation);

module.exports = router;