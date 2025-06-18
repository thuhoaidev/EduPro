const multer = require('multer');
const path = require('path');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

// Cấu hình multer cho upload file
const storage = multer.memoryStorage();

// Filter file types
const fileFilter = (req, file, cb) => {
  // Chỉ cho phép upload ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh!'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Middleware upload avatar
exports.uploadAvatar = upload.single('avatar');

// Middleware xử lý upload avatar lên Cloudinary
exports.processAvatarUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(); // Không có file upload, tiếp tục
    }

    // Kiểm tra kích thước file
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 5MB',
      });
    }

    // Upload lên Cloudinary
    const result = await uploadBufferToCloudinary(req.file.buffer, 'avatars');

    // Lưu thông tin file vào request
    req.uploadedAvatar = {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };

    next();
  } catch (error) {
    console.error('Lỗi upload avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi upload avatar',
      error: error.message,
    });
  }
};

// Middleware xóa avatar cũ từ Cloudinary
exports.deleteOldAvatar = async (req, res, next) => {
  try {
    const { deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');
    
    // Nếu có avatar mới được upload và user có avatar cũ
    if (req.uploadedAvatar && req.user && req.user.avatar) {
      const oldPublicId = getPublicIdFromUrl(req.user.avatar);
      
      if (oldPublicId && oldPublicId !== 'default-avatar') {
        try {
          await deleteFromCloudinary(oldPublicId);
          console.log('Đã xóa avatar cũ:', oldPublicId);
        } catch (deleteError) {
          console.error('Lỗi xóa avatar cũ:', deleteError);
          // Không throw error vì đây không phải lỗi nghiêm trọng
        }
      }
    }
    
    next();
  } catch (error) {
    console.error('Lỗi xóa avatar cũ:', error);
    next(); // Tiếp tục xử lý dù có lỗi
  }
}; 