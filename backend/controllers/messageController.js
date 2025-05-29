// Backend: controllers/messageController.js
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// Get all conversations for a user
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id || req.user._id
    })
    .populate('participants', 'name profileImage username')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId
    })
    .populate('sender', 'name profileImage username')
    .sort({ createdAt: 1 });
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  const { recipientId, content } = req.body;
  
  if (!content || !recipientId) {
    return res.status(400).json({ message: 'Content and recipient are required' });
  }
  
  try {
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Get the user ID (handle both req.user.id and req.user._id for compatibility)
    const userId = req.user.id || req.user._id;
    
    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });
    
    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
    }
    
    // Create new message
    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      content,
      readBy: [userId] // Sender has read their own message
    });
    
    const savedMessage = await message.save();
    
    // Update conversation with last message
    conversation.lastMessage = savedMessage._id;
    conversation.updatedAt = Date.now();
    await conversation.save();
    
    // Populate sender info before sending response
    await savedMessage.populate({
      path: 'sender',
      select: 'name profileImage username'
    });
    
    // Include conversation ID in the response
    const responseData = {
      ...savedMessage.toJSON(),
      conversation: conversation._id
    };
    
    res.status(201).json(responseData);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    // Get the user ID (handle both req.user.id and req.user._id for compatibility)
    const userId = req.user.id || req.user._id;
    
    await Message.updateMany(
      { 
        conversation: req.params.conversationId,
        sender: { $ne: userId },
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};