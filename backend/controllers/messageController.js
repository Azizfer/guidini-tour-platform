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
  console.log('🔔 Message send request received:', req.body);
  console.log('🔑 Auth headers:', req.headers.authorization ? 'Bearer token present' : 'No authorization header');
  const { recipientId, content } = req.body;
  
  if (!content || !recipientId) {
    console.log('❌ Missing required fields:', { content, recipientId });
    return res.status(400).json({ message: 'Content and recipient are required' });
  }
  
  try {
    // Log user authentication information
    if (!req.user) {
      console.log('❌ No user found in request - auth middleware may have failed');
      return res.status(401).json({ message: 'Authentication required', code: 'AUTH_REQUIRED' });
    }
    
    console.log('👤 Authenticated user:', {
      id: req.user._id || req.user.id,
      name: req.user.name || req.user.username,
      email: req.user.email
    });
    
    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    console.log('Recipient search result:', recipient ? 'Found' : 'Not found');
    
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }
    
    // Get the user ID (handle both req.user.id and req.user._id for compatibility)
    const userId = req.user.id || req.user._id;
    console.log('Sender ID:', userId);
    
    // Find existing conversation or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId] }
    });
    console.log('Conversation search result:', conversation ? 'Found' : 'Not found');
    
    if (!conversation) {
      // Create new conversation if it doesn't exist
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
    }
    
    // Create new message
    console.log('Creating new message with data:', {
      conversationId: conversation._id,
      senderId: userId,
      content,
      readBy: [userId]
    });
    
    const message = new Message({
      conversation: conversation._id,
      sender: userId,
      content,
      readBy: [userId] // Sender has read their own message
    });
    
    try {
      console.log('💾 Attempting to save message to database...');
      const savedMessage = await message.save();
      console.log('✅ Message saved successfully with ID:', savedMessage._id);
      
      // Update conversation with last message
      console.log('📝 Updating conversation with last message ID:', savedMessage._id);
      conversation.lastMessage = savedMessage._id;
      conversation.updatedAt = Date.now();
      await conversation.save();
      console.log('✅ Conversation updated successfully');
      
      // Double check that message was actually saved
      const verifyMessage = await Message.findById(savedMessage._id);
      if (!verifyMessage) {
        console.error('❌ CRITICAL ERROR: Message appears to be saved but cannot be retrieved!');
      } else {
        console.log('✅ Message verified in database with content:', verifyMessage.content);
      }
    } catch (saveError) {
      console.error('❌ Error saving message:', saveError.message);
      console.error('Full error:', saveError);
      console.error('Stack trace:', saveError.stack);
      return res.status(500).json({ 
        message: 'Failed to save message to database', 
        error: saveError.message,
        code: 'DB_SAVE_ERROR'
      });
    }
    
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