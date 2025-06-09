const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Cấu hình storage cho multer - sử dụng memory storage
const storage = multer.memoryStorage();

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new ApiError(400, 'Chỉ chấp nhận file video (mp4, webm, mov)'));
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 500 * 1024 * 1024 // giới hạn 500MB
    },
    fileFilter: fileFilter
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ApiError(400, 'File không được vượt quá 500MB'));
        }
        return next(new ApiError(400, err.message));
    }
    next(err);
};

module.exports = {
    upload,
    handleUploadError
}; 