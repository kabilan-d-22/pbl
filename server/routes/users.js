const express = require('express');
const { getUsers, deleteUser } = require('../controllers/userController');
const { auth, requireHead } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getUsers);
router.delete('/:id', auth, requireHead, deleteUser);

module.exports = router;
