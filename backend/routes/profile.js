const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../config/multer'); // now Cloudinary-based

// Get user profile
router.get('/:userId', auth, profileController.getUserProfile);

// Update profile
router.put('/', auth, profileController.updateProfile);

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), profileController.uploadAvatar);

// Toggle follow
router.post('/:userId/follow', auth, profileController.toggleFollow);

module.exports = router;