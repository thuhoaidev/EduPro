const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Constants cho folder structure
const FOLDERS = {
    COURSES: 'courses',
    VIDEOS: 'videos',
    THUMBNAILS: 'thumbnails',
    AVATARS: 'avatars',
    CERTIFICATES: 'certificates',
    BLOG_IMAGES: 'blog-images',
    INSTRUCTOR_PROFILES: 'instructor-profiles',
    COURSE_MATERIALS: 'course-materials'
};

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
 * Tạo folder path với prefix
 * @param {string} folder - Tên folder
 * @param {string} subfolder - Subfolder (optional)
 * @returns {string} - Full folder path
 */
const getFolderPath = (folder, subfolder = '') => {
    const basePath = `edupor/${folder}`;
    return subfolder ? `${basePath}/${subfolder}` : basePath;
};

/**
 * Upload file từ buffer trực tiếp lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file cần upload
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload
 */
exports.uploadBufferToCloudinary = async (fileBuffer, folder = 'misc') => {
    return new Promise((resolve, reject) => {
        const options = {
            folder: getFolderPath(folder),
            resource_type: 'auto',
        };
        if (folder !== FOLDERS.VIDEOS) {
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
            folder: getFolderPath(folder),
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
// Upload 1 video và chuyển đổi nhiều độ phân giải
exports.uploadVideoWithQualitiesToCloudinary = async (filePath, folder = FOLDERS.VIDEOS) => {
  const baseFolder = getFolderPath(folder);
  const resolutions = [
    { label: '360p', transformation: { width: 640, height: 360, crop: 'limit' } },
    { label: '720p', transformation: { width: 1280, height: 720, crop: 'limit' } },
    { label: '1080p', transformation: { width: 1920, height: 1080, crop: 'limit' } },
  ];

  const result = {
    original: null,
    variants: {},
  };

  try {
    // Upload bản gốc
    const original = await cloudinary.uploader.upload(filePath, {
      folder: baseFolder,
      resource_type: 'video',
      use_filename: true,
      unique_filename: true,
    });

    result.original = {
      url: original.secure_url,
      public_id: original.public_id,
      duration: original.duration,
    };

    // Upload từng bản chuyển đổi
    for (const { label, transformation } of resolutions) {
      const variant = await cloudinary.uploader.upload(filePath, {
        folder: baseFolder,
        resource_type: 'video',
        transformation,
        use_filename: true,
        unique_filename: true,
        public_id: `${path.parse(original.public_id).name}_${label}`, // đặt tên khác nhau
      });

      result.variants[label] = {
        url: variant.secure_url,
        public_id: variant.public_id,
      };
    }

    // Xóa file tạm
    fs.unlinkSync(filePath);

    return result;
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
};

/**
 * Upload video với streaming optimization
 * @param {string} filePath - Đường dẫn file video
 * @param {string} folder - Thư mục lưu trữ
 * @param {Object} options - Tùy chọn bổ sung
 * @returns {Promise<Object>} - Kết quả upload
 */
exports.uploadVideoWithStreaming = async (filePath, folder = FOLDERS.VIDEOS, options = {}) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: getFolderPath(folder),
            resource_type: 'video',
            use_filename: true,
            unique_filename: true,
            eager: [
                { width: 640, height: 360, crop: 'limit', format: 'mp4' },
                { width: 1280, height: 720, crop: 'limit', format: 'mp4' },
                { width: 1920, height: 1080, crop: 'limit', format: 'mp4' }
            ],
            eager_async: true,
            eager_notification_url: options.notification_url,
            ...options
        });

        // Xóa file tạm
        fs.unlinkSync(filePath);
        return result;
    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        throw error;
    }
};

/**
 * Tạo signed URL cho video (bảo mật)
 * @param {string} publicId - Public ID của video
 * @param {number} expiresAt - Thời gian hết hạn (timestamp)
 * @returns {string} - Signed URL
 */
exports.generateSignedVideoUrl = (publicId, expiresAt = Math.round(Date.now() / 1000) + 3600) => {
    return cloudinary.url(publicId, {
        resource_type: 'video',
        sign_url: true,
        type: 'upload',
        expires_at: expiresAt,
        secure: true
    });
};

/**
 * Tạo thumbnail cho video
 * @param {string} publicId - Public ID của video
 * @param {Object} options - Tùy chọn thumbnail
 * @returns {string} - URL thumbnail
 */
exports.generateVideoThumbnail = (publicId, options = {}) => {
    const defaultOptions = {
        width: 320,
        height: 180,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        format: 'jpg'
    };
    
    return cloudinary.url(publicId, {
        resource_type: 'video',
        transformation: { ...defaultOptions, ...options },
        secure: true
    });
};

// Export constants
exports.FOLDERS = FOLDERS;