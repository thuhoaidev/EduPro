const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Cấu hình Cloudinary với các biến môi trường riêng lẻ
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log để debug
// console.log('Cloudinary Config Check:');
// console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
// console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '***' : 'undefined');
// console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***' : 'undefined');
// console.log('--- End Cloudinary Config Check ---');

/**
 * Upload file từ buffer trực tiếp lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload
 */
exports.uploadBufferToCloudinary = async (fileBuffer, folder = 'misc') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: `edupor/${folder}`,
                resource_type: 'auto',
                transformation: [
                    { width: 1920, height: 1080, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            },
        );

        // Upload buffer trực tiếp
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