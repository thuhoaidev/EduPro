const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

// Cấu hình storage cho multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/courses');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'course-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new ApiError(400, 'Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)'));
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // giới hạn 5MB
    },
    fileFilter: fileFilter
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File không được vượt quá 5MB'));
        }
        return next(new ApiError(400, err.message));
    }
    next(err);
};

module.exports = {
    upload,
    handleUploadError
}; 