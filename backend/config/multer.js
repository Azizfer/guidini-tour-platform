const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

// Configure Cloudinary storage
// We choose the Cloudinary folder dynamically based on fieldname
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let targetFolder = 'guidini/documents';
    
    switch (file.fieldname) {
      case 'idCard':
        targetFolder = 'guidini/documents/carteID';
        break;
      case 'certificate':
        targetFolder = 'guidini/documents/CertifGuide';
        break;
      case 'profileImage':
        targetFolder = 'guidini/ProfileImage';
        break;
    }

    return {
      folder: targetFolder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf'],
      resource_type: file.mimetype.startsWith('image/') ? 'image' : 'raw'
    };
  },
});

// Restrict to images (and optional PDFs for documents)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed!'), false);
  }
};

// Initialise Multer with Cloudinary storage
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
});

module.exports = upload;
