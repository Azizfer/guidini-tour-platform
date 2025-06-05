const User = require('../models/User');
const Tour = require('../models/Tour');
const fs = require('fs');
const path = require('path');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Accès non autorisé' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error: error.message });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Check if user is authorized to update this profile
    if (userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier ce profil' });
    }
    
    // Update user fields
    const { name, email, phone, bio, location, languages } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (languages) user.languages = languages;
    
    user.updatedAt = new Date();
    
    // Handle profile image upload if any
    if (req.file) {
      // Delete old profile image if exists
      if (user.profileImage && user.profileImage !== '/uploads/default-profile.jpg') {
        const oldImagePath = path.join(__dirname, '..', user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      user.profileImage = `/uploads/${req.file.filename}`;
    }
    
    // Save updated user
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Check if user is authorized to delete this profile
    if (userId !== req.user.id && req.user.userType !== 'admin') {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce profil' });
    }
    
    // Delete user's profile image if exists
    if (user.profileImage && user.profileImage !== '/uploads/default-profile.jpg') {
      const imagePath = path.join(__dirname, '..', user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // If user is a guide, delete all their tours
    if (user.userType === 'guide') {
      const tours = await Tour.find({ guideId: userId });
      
      // Delete tour images
      for (const tour of tours) {
        tour.images.forEach(image => {
          const imagePath = path.join(__dirname, '..', image);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        });
      }
      
      // Delete tours from database
      await Tour.deleteMany({ guideId: userId });
    }
    
    // Delete user from database
    await User.findByIdAndDelete(userId);
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error: error.message });
  }
};

// Get all guides
exports.getAllGuides = async (req, res) => {
  try {
    const guides = await User.find({ userType: 'guide' }).select('-password');
    res.json(guides);
  } catch (error) {
    console.error('Error getting guides:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des guides', error: error.message });
  }
};

// Become a guide (convert tourist to guide)
exports.becomeGuide = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Update user type to guide
    user.userType = 'guide';
    user.updatedAt = new Date();
    
    // Update additional guide information if provided
    const { bio, languages, specialties } = req.body;
    
    if (bio) user.bio = bio;
    if (languages) user.languages = languages;
    if (specialties) user.specialties = specialties;
    
    // Save updated user
    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    
    res.json({
      message: 'Vous êtes maintenant un guide',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error becoming guide:', error);
    res.status(500).json({ message: 'Erreur lors de la conversion en guide', error: error.message });
  }
};
