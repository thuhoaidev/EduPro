const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

// Cấu hình storage cho file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Filter file cho phép
const fileFilter = (req, file, cb) => {
  // Cho phép các file PDF, JPG, PNG, MP4, MOV
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'video/mp4', 'video/mov', 'video/avi'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Loại file không được hỗ trợ. Chỉ chấp nhận PDF, JPG, PNG, MP4, MOV, AVI.'), false);
  }
};

// Cấu hình upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Middleware upload avatar
const uploadAvatar = upload.single('avatar');

// Middleware upload file hồ sơ giảng viên
const uploadInstructorProfile = upload.fields([
  { name: 'certificate_files', maxCount: 5 }, // Tối đa 5 file bằng cấp
  { name: 'cv_file', maxCount: 1 }, // 1 file CV
  { name: 'demo_video', maxCount: 1 }, // 1 video demo
  { name: 'other_documents', maxCount: 10 }, // Tối đa 10 file hồ sơ khác
]);

// Middleware xử lý lỗi upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 10MB.',
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Số lượng file vượt quá giới hạn.',
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Tên field file không hợp lệ.',
      });
    }
  }
  
  if (error.message.includes('Loại file không được hỗ trợ')) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  
  next(error);
};

module.exports = {
  uploadAvatar,
  uploadInstructorProfile,
  handleUploadError,
}; 