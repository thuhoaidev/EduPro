const multer = require('multer');
const path = require('path');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');

// Cấu hình multer cho upload file
const storage = multer.memoryStorage();

// Filter file types cho avatar
const avatarFileFilter = (req, file, cb) => {
  console.log('DEBUG - avatarFileFilter - file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname
  });

  // Chấp nhận nhiều định dạng ảnh
  const allowedImageTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];

  if (allowedImageTypes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    console.log('DEBUG - File accepted by avatarFileFilter');
    cb(null, true);
  } else {
    console.log('DEBUG - File rejected by avatarFileFilter:', file.mimetype);
    cb(new Error('Chỉ cho phép upload file ảnh (JPEG, PNG, GIF, WebP, BMP, TIFF)!'), false);
  }
};

// Filter file types cho instructor profile
const instructorFileFilter = (req, file, cb) => {
  // Nếu là trường cv thì chỉ cho phép PDF, DOC, DOCX
  if (file.fieldname === 'cv') {
    const allowedCvMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (allowedCvMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload file PDF, DOC, DOCX cho CV!'), false);
    }
    return;
  }
  // Các trường khác giữ nguyên logic cũ
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
    fileSize: 10 * 1024 * 1024, // 10MB
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
    console.log('DEBUG - processAvatarUpload - req.file:', req.file);
    console.log('DEBUG - processAvatarUpload - req.body:', req.body);

    if (!req.file) {
      console.log('DEBUG - No file uploaded, continuing...');
      return next(); // Không có file upload, tiếp tục
    }

    console.log('DEBUG - File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? 'Buffer exists' : 'No buffer'
    });

    // Kiểm tra kích thước file
    if (req.file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 10MB',
      });
    }

    console.log('DEBUG - Uploading to Cloudinary...');
    try {
      const result = await uploadBufferToCloudinary(req.file.buffer, 'avatars');
      console.log('DEBUG - Cloudinary upload result:', result);
      req.uploadedAvatar = {
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
      };
      console.log('DEBUG - req.uploadedAvatar set:', req.uploadedAvatar);
      next();
    } catch (cloudErr) {
      console.error('Lỗi upload Cloudinary:', cloudErr);
      if (cloudErr && cloudErr.message && cloudErr.message.includes('Timeout')) {
        return res.status(504).json({
          success: false,
          message: 'Upload ảnh lên Cloudinary bị timeout. Vui lòng thử lại hoặc chọn ảnh nhỏ hơn 2MB.',
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Lỗi upload ảnh lên Cloudinary',
        error: cloudErr.message || cloudErr,
      });
    }
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
    console.log('DEBUG - processInstructorFilesUpload - req.files:', req.files); // Log toàn bộ files nhận được từ multer
    console.log('DEBUG - processInstructorFilesUpload - req.body:', req.body); // Log body data
    console.log('DEBUG - processInstructorFilesUpload - req.headers:', req.headers['content-type']); // Log content type
    
    if (!req.files) {
      console.log('DEBUG - No files uploaded, continuing...');
      return next(); // Không có file upload, tiếp tục
    }

    const uploadedFiles = {};

    // Xử lý Avatar
    if (req.files.avatar && req.files.avatar[0]) {
      console.log('DEBUG - Processing avatar file:', req.files.avatar[0]);
      const avatarFile = req.files.avatar[0];
      if (avatarFile.size > 5 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File ảnh đại diện quá lớn. Kích thước tối đa là 5MB',
        });
      }
      const result = await uploadBufferToCloudinary(avatarFile.buffer, 'instructor-avatars');
      console.log('DEBUG - Cloudinary avatar upload result:', result);
      uploadedFiles.avatar = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: avatarFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    } else {
      console.log('DEBUG - No avatar file found');
    }

    // Xử lý CV file
    if (req.files.cv && req.files.cv[0]) {
      console.log('DEBUG - Processing CV file:', req.files.cv[0]);
      const cvFile = req.files.cv[0];
      if (cvFile.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'File CV quá lớn. Kích thước tối đa là 10MB',
        });
      }
      const result = await uploadBufferToCloudinary(cvFile.buffer, 'instructor-cv');
      console.log('DEBUG - Cloudinary CV upload result:', result);
      uploadedFiles.cv = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: cvFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    } else {
      console.log('DEBUG - No CV file found');
    }

    // Xử lý certificates files
    if (req.files.certificates && req.files.certificates.length > 0) {
      console.log('DEBUG - Processing certificates files:', req.files.certificates);
      uploadedFiles.certificates = [];
      for (const certFile of req.files.certificates) {
        console.log('DEBUG - Processing certificate file:', certFile);
        if (certFile.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            message: `File chứng chỉ "${certFile.originalname}" quá lớn. Kích thước tối đa là 10MB`,
          });
        }
        const result = await uploadBufferToCloudinary(certFile.buffer, 'instructor-certificates');
        console.log('DEBUG - Cloudinary certificate upload result:', result);
        uploadedFiles.certificates.push({
          url: result.secure_url,
          public_id: result.public_id,
          original_name: certFile.originalname,
          size: result.bytes,
          format: result.format,
        });
      }
    } else {
      console.log('DEBUG - No certificates files found');
    }

    // Xử lý demo video
    if (req.files.demoVideo && req.files.demoVideo[0]) {
      console.log('DEBUG - Processing demo video file:', req.files.demoVideo[0]);
      const videoFile = req.files.demoVideo[0];
      if (videoFile.size > 50 * 1024 * 1024) { // 50MB cho video
        return res.status(400).json({
          success: false,
          message: 'File demo video quá lớn. Kích thước tối đa là 50MB',
        });
      }
      const result = await uploadBufferToCloudinary(videoFile.buffer, 'instructor-demo-videos');
      console.log('DEBUG - Cloudinary demo video upload result:', result);
      uploadedFiles.demoVideo = {
        url: result.secure_url,
        public_id: result.public_id,
        original_name: videoFile.originalname,
        size: result.bytes,
        format: result.format,
      };
    } else {
      console.log('DEBUG - No demo video file found');
    }

    req.uploadedInstructorFiles = uploadedFiles;
    console.log('DEBUG - Final uploadedInstructorFiles:', uploadedFiles); // Log kết quả cuối cùng
    next();
  } catch (error) {
    console.error('Lỗi upload instructor files:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi upload instructor files',
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