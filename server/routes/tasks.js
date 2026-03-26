const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  completeTask,
  deleteTask
} = require('../controllers/taskController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getTasks);
router.post('/', auth, createTask);
router.put('/:id', auth, updateTask);
router.patch('/:id/complete', auth, completeTask);
router.delete('/:id', auth, deleteTask);

module.exports = router;
