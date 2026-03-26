const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Debug check: This should print [Function: register] [Function: login]
console.log('Auth Handlers:', register, login);

router.post('/register', register);
router.post('/login', login);

module.exports = router;