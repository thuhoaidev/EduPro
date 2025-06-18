const multer = require('multer');
const path = require('path');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

// Cấu hình multer cho upload file
const storage = multer.memoryStorage();

// Filter file types cho avatar
const avatarFileFilter = (req, file, cb) => {
  // Chỉ cho phép upload ảnh
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh!'), false);
  }
};

// Filter file types cho instructor profile
const instructorFileFilter = (req, file, cb) => {
  // Cho phép PDF, DOC, DOCX, ảnh và video
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file PDF, DOC, DOCX, ảnh hoặc video!'), false);
  }
};

// Cấu hình multer cho avatar
const avatarUpload = multer({
  storage: storage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Cấu hình multer cho instructor profile
const instructorUpload = multer({
  storage: storage,
  fileFilter: instructorFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Middleware upload avatar
exports.uploadAvatar = avatarUpload.single('avatar');

// Middleware upload instructor profile files
exports.uploadInstructorFiles = instructorUpload.fields([
  { name: 'cv_file', maxCount: 1 },
  { name: 'degrees', maxCount: 5 },
  { name: 'demo_video', maxCount: 1 }
]);

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

// Middleware xử lý upload instructor profile files lên Cloudinary
exports.processInstructorFilesUpload = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(); // Không có file upload, tiếp tục
    }

    const uploadedFiles = {};

    // Xử lý CV file
    if (req.files.cv_file && req.files.cv_file[0]) {
      const cvFile = req.files.cv_file[0];
      
      if (cvFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File CV quá lớn. Kích thước tối đa là 10MB',
        });
      }

      const result = await uploadBufferToCloudinary(cvFile.buffer, 'instructor-cv');
      uploadedFiles.cv_file = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: cvFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    }

    // Xử lý degrees files
    if (req.files.degrees && req.files.degrees.length > 0) {
      uploadedFiles.degrees = [];
      
      for (const degreeFile of req.files.degrees) {
        if (degreeFile.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File degree "${degreeFile.originalname}" quá lớn. Kích thước tối đa là 10MB`,
          });
        }

        const result = await uploadBufferToCloudinary(degreeFile.buffer, 'instructor-degrees');
        uploadedFiles.degrees.push({
          url: result.secure_url,
          public_id: result.public_id,
          original_name: degreeFile.originalname,
          size: result.bytes,
          format: result.format,
        });
      }
    }

    // Xử lý demo video
    if (req.files.demo_video && req.files.demo_video[0]) {
      const videoFile = req.files.demo_video[0];
      
      if (videoFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File demo video quá lớn. Kích thước tối đa là 10MB',
        });
      }

      const result = await uploadBufferToCloudinary(videoFile.buffer, 'instructor-demo-videos');
      uploadedFiles.demo_video = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: videoFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    }

    // Lưu thông tin files vào request
    req.uploadedInstructorFiles = uploadedFiles;

    next();
  } catch (error) {
    console.error('Lỗi upload instructor files:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi upload file',
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