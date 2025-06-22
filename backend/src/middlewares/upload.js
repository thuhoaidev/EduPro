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
    'image/webp',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/webm'
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

// Middleware upload instructor profile files (updated for new form)
exports.uploadInstructorFiles = instructorUpload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cv', maxCount: 1 },
  { name: 'certificates', maxCount: 5 },
  { name: 'demoVideo', maxCount: 1 }
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

// Middleware xử lý upload instructor profile files lên Cloudinary (updated)
exports.processInstructorFilesUpload = async (req, res, next) => {
  try {
    if (!req.files) {
      return next(); // Không có file upload, tiếp tục
    }

    const uploadedFiles = {};

    // Xử lý Avatar
    if (req.files.avatar && req.files.avatar[0]) {
      const avatarFile = req.files.avatar[0];
      
      if (avatarFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File ảnh đại diện quá lớn. Kích thước tối đa là 5MB',
        });
      }

      const result = await uploadBufferToCloudinary(avatarFile.buffer, 'instructor-avatars');
      uploadedFiles.avatar = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: avatarFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    }

    // Xử lý CV file
    if (req.files.cv && req.files.cv[0]) {
      const cvFile = req.files.cv[0];
      
      if (cvFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File CV quá lớn. Kích thước tối đa là 10MB',
        });
      }

      const result = await uploadBufferToCloudinary(cvFile.buffer, 'instructor-cv');
      uploadedFiles.cv = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: cvFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    }

    // Xử lý certificates files
    if (req.files.certificates && req.files.certificates.length > 0) {
      uploadedFiles.certificates = [];
      
      for (const certFile of req.files.certificates) {
        if (certFile.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File chứng chỉ "${certFile.originalname}" quá lớn. Kích thước tối đa là 10MB`,
          });
        }

        const result = await uploadBufferToCloudinary(certFile.buffer, 'instructor-certificates');
        uploadedFiles.certificates.push({
          url: result.secure_url,
          public_id: result.public_id,
          original_name: certFile.originalname,
          size: result.bytes,
          format: result.format,
        });
      }
    }

    // Xử lý demo video
    if (req.files.demoVideo && req.files.demoVideo[0]) {
      const videoFile = req.files.demoVideo[0];
      
      if (videoFile.size > 50 * 1024 * 1024) { // 50MB cho video
        return res.status(400).json({
          success: false,
          message: 'File demo video quá lớn. Kích thước tối đa là 50MB',
        });
      }

      const result = await uploadBufferToCloudinary(videoFile.buffer, 'instructor-demo-videos');
      uploadedFiles.demoVideo = {
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
    
    // Nếu có avatar cũ và có avatar mới được upload
    if (req.user && req.user.avatar && req.uploadedAvatar) {
      const oldAvatarPublicId = getPublicIdFromUrl(req.user.avatar);
      if (oldAvatarPublicId && !oldAvatarPublicId.includes('default-avatar')) {
        await deleteFromCloudinary(oldAvatarPublicId);
      }
    }
    
    next();
  } catch (error) {
    console.error('Lỗi xóa avatar cũ:', error);
    // Không dừng quá trình nếu lỗi xóa avatar cũ
    next();
  }
}; 