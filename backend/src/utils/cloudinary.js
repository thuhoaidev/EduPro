const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cấu hình Cloudinary với các biến môi trường riêng lẻ
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log thông tin tài khoản Cloudinary (không log api_secret)
console.log('[Cloudinary] cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('[Cloudinary] api_key:', process.env.CLOUDINARY_API_KEY);

/**
 * Upload file từ buffer trực tiếp lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload
 */
exports.uploadBufferToCloudinary = async (fileBuffer, folder = 'misc') => {
    return new Promise((resolve, reject) => {
        const options = {
            folder: `edupor/${folder}`,
            resource_type: 'auto',
        };
        if (folder !== 'videos') {
            options.transformation = [
                { width: 1920, height: 1080, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' },
            ];
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            options,
            (error, result) => {
                if (error) {
                    console.error('[Cloudinary] Upload error:', error); // Bổ sung log chi tiết lỗi
                    return reject(error);
                }
                resolve(result);
            },
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Upload file lên Cloudinary
 * @param {string} filePath - Đường dẫn file cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload
 */
exports.uploadToCloudinary = async (filePath, folder = 'misc') => {
    try {
        // Upload file với cấu hình resize
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `edupor/${folder}`,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
            transformation: [
                { width: 1920, height: 1080, crop: 'limit' }, // Giới hạn kích thước tối đa
                { quality: 'auto:good' }, // Tự động tối ưu chất lượng
                { fetch_format: 'auto' }, // Tự động chọn định dạng tốt nhất
            ],
        });

        // Xóa file tạm sau khi upload
        fs.unlinkSync(filePath);

        return result;
    } catch (error) {
        // Xóa file tạm nếu có lỗi
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        throw error;
    }
};

/**
 * Xóa file từ Cloudinary
 * @param {string} publicId - Public ID của file trên Cloudinary
 * @returns {Promise<Object>} - Kết quả xóa
 */
exports.deleteFromCloudinary = async (publicId) => {
    return cloudinary.uploader.destroy(publicId);
};

/**
 * Lấy public ID từ URL Cloudinary
 * @param {string} url - URL của file trên Cloudinary
 * @returns {string} - Public ID
 */
exports.getPublicIdFromUrl = (url) => {
    if (!url) return null;

    const matches = url.match(/\/v\d+\/([^/]+)\./);
    return matches ? matches[1] : null;
}; 