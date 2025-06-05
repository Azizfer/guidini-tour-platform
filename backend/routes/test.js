const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// These routes are public and don't require authentication

// Test route to check if the server is running
router.get('/ping', (req, res) => {
  res.json({ 
    status: 'success', 
    message: 'Backend server is running!',
    timestamp: new Date().toISOString()
  });
});

// Test route to check MongoDB connection
router.get('/db-status', async (req, res) => {
  try {
    // Check MongoDB connection state
    const state = mongoose.connection.readyState;
    let stateMessage;
    
    switch(state) {
      case 0:
        stateMessage = 'Disconnected';
        break;
      case 1:
        stateMessage = 'Connected';
        break;
      case 2:
        stateMessage = 'Connecting';
        break;
      case 3:
        stateMessage = 'Disconnecting';
        break;
      default:
        stateMessage = 'Unknown';
    }
    
    res.json({
      status: state === 1 ? 'success' : 'error',
      connection: stateMessage,
      dbName: mongoose.connection.name || 'Not connected',
      host: mongoose.connection.host || 'Not connected'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Error checking database status',
      error: error.message
    });
  }
});

module.exports = router;
