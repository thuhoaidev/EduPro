const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Cấu hình storage cho multer - sử dụng memory storage
const storage = multer.memoryStorage();

// Kiểm tra file type
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|heic/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    }
    cb(new ApiError(400, 'Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp, heic)'));
};

// Cấu hình multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // giới hạn 10MB
    },
    fileFilter: fileFilter
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        next(new ApiError(400, 'Lỗi khi upload file: ' + err.message));
    } else if (err) {
        console.error('Upload error:', err);
        next(new ApiError(500, 'Lỗi không xác định khi upload file'));
    }
    // Không gọi next() ở đây để tránh gọi next() hai lần
};

module.exports = {
    upload,
    handleUploadError
}; 