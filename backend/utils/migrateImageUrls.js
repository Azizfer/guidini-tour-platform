/*
 * Script: migrateImageUrls.js
 * Purpose: Remove legacy local /uploads/ paths from User.profileImage and Tour.image.
 * Run with: node backend/utils/migrateImageUrls.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Tour = require('../models/Tour');

(async () => {
  try {
    const uri = process.env.MONGODB_URI || process.env.DB_URI || process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ No MongoDB URI found in env');
      process.exit(1);
    }

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');

    // Clean users
    const userRes = await User.updateMany(
      { profileImage: { $regex: '^/uploads/' } },
      { $set: { profileImage: '' } }
    );

    // Clean tours
    const tourRes = await Tour.updateMany(
      { image: { $regex: '^/uploads/' } },
      { $set: { image: '' } }
    );

    console.log(`🧹 Users cleaned: ${userRes.modifiedCount}`);
    console.log(`🧹 Tours cleaned: ${tourRes.modifiedCount}`);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
