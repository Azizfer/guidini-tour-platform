const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Diagnostic logs to verify Cloudinary connectivity (runs at server startup)
if (process.env.NODE_ENV !== 'production') {
  const cfg = cloudinary.config();
  console.log(`🌤️  Cloudinary configured for cloud: ${cfg.cloud_name}`);

  // Ping Cloudinary to ensure credentials are valid
  cloudinary.api.ping((err, res) => {
    if (err) {
      console.error('❌ Cloudinary ping failed:', err);
    } else {
      console.log('✅ Cloudinary ping OK:', res);
    }
  });
}

module.exports = cloudinary;
