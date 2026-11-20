const User = require('../models/User');
const Tour = require('../models/Tour');
const TourReview = require('../models/TourReview');

// Get user profile with stats
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Get user profile
    const user = await User.findById(userId)
      .select('-password -__v -createdAt -updatedAt');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats based on user type
    if (user.userType === 'guide') {
      const [activeTours, completedTours, reviews] = await Promise.all([
        Tour.countDocuments({ guideId: userId, tourStatus: 'active' }),
        Tour.countDocuments({ guideId: userId, tourStatus: 'completed' }),
        TourReview.find({ guideId: userId })
          .populate('userId', 'name avatar')
          .sort({ createdAt: -1 })
          .limit(5)
      ]);

      return res.status(200).json({
        ...user.toObject(),
        stats: {
          toursCount: activeTours,
          completedTours,
          rating: user.rating,
          reviewCount: reviews.length
        },
        recentReviews: reviews
      });
    } else {
      const [pastTrips, upcomingTrips, reviewsGiven] = await Promise.all([
        Tour.countDocuments({ 'participants.userId': userId, tourStatus: 'completed' }),
        Tour.countDocuments({ 'participants.userId': userId, tourStatus: 'active' }),
        TourReview.countDocuments({ userId })
      ]);

      return res.status(200).json({
        ...user.toObject(),
        stats: {
          tripsCount: pastTrips + upcomingTrips,
          reviewsGiven,
          favoriteDestinations: user.favoriteDestinations || []
        }
      });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    // Prevent changing certain fields
    delete updates.userType;
    delete updates.rating;
    delete updates.reviewCount;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -__v');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ message: error.message });
  }
};

// Upload avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path }, // Cloudinary URL
      { new: true }
    ).select('-password -__v');

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle follow user
exports.toggleFollow = async (req, res) => {
  try {
    const userId = req.user._id;
    const profileId = req.params.userId;

    if (userId.toString() === profileId.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const user = await User.findById(userId);
    const profile = await User.findById(profileId);

    if (!user || !profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = user.following.includes(profileId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(userId, { $pull: { following: profileId } });
      await User.findByIdAndUpdate(profileId, { $pull: { followers: userId } });
    } else {
      // Follow
      await User.findByIdAndUpdate(userId, { $addToSet: { following: profileId } });
      await User.findByIdAndUpdate(profileId, { $addToSet: { followers: userId } });
    }

    res.status(200).json({ success: true, isFollowing: !isFollowing });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ message: 'Server error' });
  }
};