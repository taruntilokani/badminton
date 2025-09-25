const multer = require('multer');
const path = require('path');

// Generic multer configuration factory
const configureMulter = (destinationFolder = 'uploads/', fieldName = 'image') => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, destinationFolder); // Use the provided destination folder
    },
    filename: function (req, file, cb) {
      // Create a unique filename
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  // Optional: Add file filter for image types if needed
  // const fileFilter = (req, file, cb) => {
  //   if (file.mimetype.startsWith('image/')) {
  //     cb(null, true);
  //   } else {
  //     cb(new Error('Only image files are allowed!'), false);
  //   }
  // };

  const upload = multer({
    storage: storage,
    // fileFilter: fileFilter, // Uncomment to add file type validation
    limits: {
      fileSize: 1024 * 1024 * 5 // Limit file size to 5MB
    }
  });

  // Return the multer middleware for the specified field
  return upload.single(fieldName);
};

module.exports = { configureMulter };
