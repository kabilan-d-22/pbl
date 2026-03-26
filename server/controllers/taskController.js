const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let query = {};
    if (user.role === 'Head') {
      query = { assigned_by: userId };
    } else {
      query = { assigned_to: userId };
    }

    const tasks = await Task.find(query).populate('assigned_to', 'name').sort({ created_at: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, category, priority, assignedTo, dueDate } = req.body;
    const userId = req.user.id;

    const head = await User.findById(userId);
    if (head.role !== 'Head') {
      return res.status(403).json({ error: 'Only Heads can create tasks' });
    }

    const newTask = new Task({
      title,
      description: description || '',
      category: category || 'General',
      priority,
      assigned_to: assignedTo,
      assigned_by: userId,
      due_date: dueDate,
      status: 'Pending'
    });

    const task = await newTask.save();
    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Authorization: Only the creator or the assignee can update the task
    if (task.assigned_by.toString() !== userId && task.assigned_to.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedTask);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid Task ID format' });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assigned_to.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to complete this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(id, {
      status: 'Completed',
      completed_at: new Date()
    }, { new: true });

    res.json(updatedTask);
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (task.assigned_by.toString() !== userId) {
      return res.status(403).json({ error: 'Only the task creator can delete it' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = { 
  getTasks, 
  createTask, 
  updateTask, 
  completeTask, 
  deleteTask 
};