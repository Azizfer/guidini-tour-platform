require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/Guidini');

    const admins = [
      { email: 'aziz.fer3@gmail.com', password: 'adminadmin', name: 'Admin 1' },
      { email: 'manarsaadaoui45@gmail.com', password: 'adminadmin', name: 'Admin 2' },
    ];

    for (const a of admins) {
      const hash = await bcrypt.hash(a.password, 10);
      await User.updateOne(
        { email: a.email },
        {
          $set: {
            username: a.email,
            email: a.email,
            name: a.name,
            password: hash,
            userType: 'tourist', // or 'guide'
            isAdmin: true,
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    }

    console.log('✅ Admin accounts seeded');
  } catch (err) {
    console.error('Error seeding admins:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
})();
