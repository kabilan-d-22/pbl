const User = require('../models/User');

const getUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentUser = await User.findById(userId);

    const users = await User.find({ group_id: currentUser.group_id })
      .select('id name email role created_at');

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const currentUser = await User.findById(userId);

    if (currentUser.role !== 'Head') {
      return res.status(403).json({ error: 'Only Heads can remove users' });
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (targetUser.group_id.toString() !== currentUser.group_id.toString()) {
      return res.status(403).json({ error: 'User not in your group' });
    }

    if (targetUser.role === 'Head') {
      return res.status(403).json({ error: 'Cannot remove a Head user' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to remove user' });
  }
};

module.exports = { getUsers, deleteUser };