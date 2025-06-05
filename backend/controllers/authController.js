const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Register a new user
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, email, password, userType,
      profileImage, languages, travelPurpose, travelCompanions, budget,
      expertise, coveredGovernorates, yearsOfExperience, description,
      idCard, certificate
      // verificationToken will be handled in a subsequent step
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    // Create new user
    user = new User({
      username: name, // Temporarily using name for username
      name, email, password,
      userType: userType || 'tourist',
      profileImage, languages, travelPurpose, travelCompanions, budget,
      expertise, coveredGovernorates, yearsOfExperience, description,
      idCard, certificate,
      // Ensure your User model schema in 'backend/models/User.js' (and discriminators) includes these fields
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save user to database
    await user.save();

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in register:', error.message, error.stack);
    // Check if it's a Mongoose validation error for more specific feedback
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Erreur de validation des données lors de l\'inscription.', errors: error.errors });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Identifiants invalides' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        userType: user.userType
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            profileImage: user.profileImage
          }
        });
      }
    );
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, bio, location } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (location) user.location = location;
    
    user.updatedAt = new Date();
    
    // Save updated user
    await user.save();
    
    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        location: user.location,
        userType: user.userType,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user by ID
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = new Date();
    
    // Save updated user
    await user.save();
    
    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
