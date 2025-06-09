const multer = require('multer');
const path = require('path');
const fs = require('fs');

const avatarUploadDir = path.join(__dirname, '../uploads/avatars');

// Tạo thư mục nếu chưa tồn tại
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadDir); // ✅ Đường tuyệt đối
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;
