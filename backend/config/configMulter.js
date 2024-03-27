const multer = require('multer');
const path = require('path');

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'static/avatars'); 
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: avatarStorage });

module.exports = upload;
