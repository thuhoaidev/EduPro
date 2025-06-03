const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Remove explicit config, Cloudinary will automatically use CLOUDINARY_URL from environment variables loaded by dotenv
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

/**
 * Upload file lên Cloudinary
 * @param {string} filePath - Đường dẫn file cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload
 */
exports.uploadToCloudinary = async (filePath, folder = 'misc') => {
    try {
        // Upload file
        const result = await cloudinary.uploader.upload(filePath, {
            folder: `edupor/${folder}`,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true
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
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw error;
    }
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