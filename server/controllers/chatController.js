const Message = require('../models/Message');
const User = require('../models/User');
const Group = require('../models/Group');

// Get messages between current user and another person
const getMessages = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const sender = await User.findById(senderId);
    
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      group_id: sender.group_id,
      content
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Add to server/controllers/chatController.js

const deleteConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    // Remove messages where the current user (Head) is either sender or receiver
    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
};

module.exports = { getMessages, sendMessage, deleteConversation };