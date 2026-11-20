const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const groupController = require('../controllers/groupController');

// All routes require authentication
router.use(auth);

// Create a new group
router.post('/', groupController.createGroup);

// Invite a user to group
router.post('/:id/invite', groupController.inviteUser);

// Respond to an invite (accept / reject)
router.post('/:id/respond', groupController.respondInvite);

// Get groups related to current user
router.get('/my', groupController.getMyGroups);

module.exports = router;
