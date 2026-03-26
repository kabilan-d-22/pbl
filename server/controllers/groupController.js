const Group = require('../models/Group');
const User = require('../models/User');

const getGroup = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user to get their group_id
    const user = await User.findById(userId);

    if (!user || !user.group_id) {
      return res.status(404).json({ error: 'Not part of any group' });
    }

    // Find the group details
    const group = await Group.findById(user.group_id);

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Get group error:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
};

module.exports = {
  getGroup
};