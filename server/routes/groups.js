const express = require('express');
const { getGroup } = require('../controllers/groupController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getGroup);

module.exports = router;
