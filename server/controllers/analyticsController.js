const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');

const getTeamAnalytics = async (req, res) => {
  try {
    // FIX: Define requesterId from the authenticated user
    const requesterId = req.user.id; 
    const user = await User.findById(requesterId);

    if (!user || user.role !== 'Head') {
      return res.status(403).json({ error: 'Only Heads can view team analytics' });
    }

    // Get team members in the same group excluding the Head
    const teamMembers = await User.find({ 
      group_id: user.group_id, 
      _id: { $ne: requesterId } 
    }).select('name');

    // Get all tasks assigned by this Head
    const allTasks = await Task.find({ assigned_by: requesterId });

    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const pendingTasks = allTasks.filter(t => t.status === 'Pending');

    const tasksPerUser = teamMembers.map(member => {
      const memberTasks = allTasks.filter(t => t.assigned_to.toString() === member._id.toString());
      const memberCompleted = memberTasks.filter(t => t.status === 'Completed');
      return {
        userId: member._id,
        name: member.name,
        total: memberTasks.length,
        completed: memberCompleted.length,
        pending: memberTasks.length - memberCompleted.length,
        completionRate: memberTasks.length > 0
          ? Math.round((memberCompleted.length / memberTasks.length) * 100)
          : 0
      };
    });

    // Add this logic inside both getTeamAnalytics and getUserAnalytics 
// where categoryStats is calculated
const categoryStats = {};
allTasks.forEach(task => {
  if (!categoryStats[task.category]) {
    categoryStats[task.category] = { 
      total: 0, 
      completed: 0,
      highTotal: 0, highCompleted: 0,
      mediumTotal: 0, mediumCompleted: 0,
      lowTotal: 0, lowCompleted: 0
    };
  }
  
  categoryStats[task.category].total++;
  if (task.status === 'Completed') {
    categoryStats[task.category].completed++;
  }

  // Track Priority Stats
  const priorityKey = task.priority.toLowerCase(); // 'high', 'medium', or 'low'
  categoryStats[task.category][`${priorityKey}Total`]++;
  if (task.status === 'Completed') {
    categoryStats[task.category][`${priorityKey}Completed`]++;
  }
});

    const completionTrend = {};
    completedTasks.forEach(task => {
      if (task.completed_at) {
        const date = new Date(task.completed_at).toISOString().split('T')[0];
        completionTrend[date] = (completionTrend[date] || 0) + 1;
      }
    });

    const productivity = allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

    res.json({
      totalMembers: teamMembers.length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      productivity,
      tasksPerUser,
      categoryStats,
      completionTrend,
      activities: [] // Activities can be populated if you implement an Activity model
    });

  } catch (error) {
    console.error('Get team analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch team analytics' });
  }
};

const getUserAnalytics = async (req, res) => {
  try {
    const requesterId = req.user.id;
    let userId = req.params.userId || requesterId;

    // Handle string "undefined" sent from frontend
    if (userId === 'undefined') userId = requesterId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid User ID format' });
    }

    const requester = await User.findById(requesterId);
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (requester.role !== 'Head' && requesterId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (requester.group_id.toString() !== targetUser.group_id.toString()) {
      return res.status(403).json({ error: 'User not in your group' });
    }

    const allTasks = await Task.find({ assigned_to: userId });

    const completedTasks = allTasks.filter(t => t.status === 'Completed');
    const pendingTasks = allTasks.filter(t => t.status === 'Pending');

    const completionTrend = {};
    completedTasks.forEach(task => {
      if (task.completed_at) {
        const date = new Date(task.completed_at).toISOString().split('T')[0];
        completionTrend[date] = (completionTrend[date] || 0) + 1;
      }
    });

    // Add this logic inside both getTeamAnalytics and getUserAnalytics 
// where categoryStats is calculated
const categoryStats = {};
allTasks.forEach(task => {
  if (!categoryStats[task.category]) {
    categoryStats[task.category] = { 
      total: 0, 
      completed: 0,
      highTotal: 0, highCompleted: 0,
      mediumTotal: 0, mediumCompleted: 0,
      lowTotal: 0, lowCompleted: 0
    };
  }
  
  categoryStats[task.category].total++;
  if (task.status === 'Completed') {
    categoryStats[task.category].completed++;
  }

  // Track Priority Stats
  const priorityKey = task.priority.toLowerCase(); // 'high', 'medium', or 'low'
  categoryStats[task.category][`${priorityKey}Total`]++;
  if (task.status === 'Completed') {
    categoryStats[task.category][`${priorityKey}Completed`]++;
  }
});

    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((acc, task) => {
          const diff = new Date(task.completed_at) - new Date(task.created_at);
          return acc + diff;
        }, 0) / completedTasks.length 
      : 0;

    const productivity = allTasks.length > 0
      ? Math.round((completedTasks.length / allTasks.length) * 100)
      : 0;

    res.json({
      userName: targetUser.name,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      pendingTasks: pendingTasks.length,
      productivity,
      completionTrend,
      categoryStats,
      avgCompletionTime: Math.round(avgCompletionTime / (1000 * 60 * 60))
    });

  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch user analytics' });
  }
};

module.exports = {
  getTeamAnalytics,
  getUserAnalytics
};