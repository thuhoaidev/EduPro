const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Cấu hình storage cho multer - sử dụng memory storage
const storage = multer.memoryStorage();

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
        return cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file video!'), false);
    }
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, message: 'File quá lớn hoặc lỗi upload', error: err.message });
    } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
};

module.exports = {
    upload,
    handleUploadError
}; 