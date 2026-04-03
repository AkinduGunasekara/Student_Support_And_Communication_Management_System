const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for message attachments
const messageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'student-support/messages',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'txt', 'gif'],
  },
});

// Multer middleware for message uploads
const messageUpload = multer({ 
  storage: messageStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = { messageUpload, cloudinary };