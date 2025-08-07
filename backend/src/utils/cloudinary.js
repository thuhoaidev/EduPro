const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);
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
exports.uploadBufferToCloudinary = async (fileBuffer, folder = 'misc', additionalOptions = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: `edupor/${folder}`,
      resource_type: 'auto',
      ...additionalOptions,
    };
    if (folder !== 'videos') {
      options.transformation = [
        { width: 1920, height: 1080, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ];
    }

    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('[Cloudinary] Upload error:', error); // Bổ sung log chi tiết lỗi
        return reject(error);
      }
      resolve(result);
    });
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
exports.deleteFromCloudinary = async publicId => {
  return cloudinary.uploader.destroy(publicId);
};

/**
 * Lấy public ID từ URL Cloudinary
 * @param {string} url - URL của file trên Cloudinary
 * @returns {string} - Public ID
 */
exports.getPublicIdFromUrl = url => {
  if (!url) return null;

  const matches = url.match(/\/v\d+\/([^/]+)\./);
  return matches ? matches[1] : null;
};

/**
 * Tính thời lượng video từ buffer
 * @param {Buffer} videoBuffer - Buffer của video file
 * @returns {Promise<number>} - Thời lượng video tính bằng giây
 */
exports.getVideoDuration = videoBuffer => {
  return new Promise((resolve, reject) => {
    // Tạo file tạm để ffmpeg có thể đọc
    const tempPath = path.join(__dirname, `../temp_${Date.now()}.mp4`);

    fs.writeFileSync(tempPath, videoBuffer);

    ffmpeg.ffprobe(tempPath, (err, metadata) => {
      // Xóa file tạm
      try {
        fs.unlinkSync(tempPath);
      } catch (unlinkError) {
        console.error('Error deleting temp file:', unlinkError);
      }

      if (err) {
        console.error('Error getting video duration:', err);
        resolve(0); // Trả về 0 nếu không thể đọc duration
        return;
      }

      const duration = metadata.format.duration || 0;
      resolve(Math.round(duration));
    });
  });
};
// Upload 1 video và chuyển đổi nhiều độ phân giải
exports.uploadVideoWithQualitiesToCloudinary = async (filePath, folder = 'videos') => {
  const baseFolder = `edupor/${folder}`;
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
 * Upload video với nhiều chất lượng từ buffer
 * @param {Buffer} fileBuffer - Buffer của file video
 * @param {string} folder - Thư mục lưu trữ trên Cloudinary
 * @returns {Promise<Object>} - Kết quả upload với các chất lượng
 */
exports.uploadMultipleQualitiesToCloudinary = async (fileBuffer, folder = 'videos') => {
  const baseFolder = `edupor/${folder}`;
  const resolutions = [
    { label: '360p', transformation: { width: 640, height: 360, crop: 'limit' } },
    { label: '720p', transformation: { width: 1280, height: 720, crop: 'limit' } },
    { label: '1080p', transformation: { width: 1920, height: 1080, crop: 'limit' } },
  ];

  const result = {};

  try {
    // Upload từng bản chuyển đổi
    for (const { label, transformation } of resolutions) {
      const variant = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: baseFolder,
            resource_type: 'video',
            transformation,
            use_filename: true,
            unique_filename: true,
          },
          (error, result) => {
            if (error) {
              console.error(`[Cloudinary] Upload error for ${label}:`, error);
              return reject(error);
            }
            resolve(result);
          },
        );
        uploadStream.end(fileBuffer);
      });

      result[label] = {
        url: variant.secure_url,
        public_id: variant.public_id,
      };
    }

    return result;
  } catch (error) {
    console.error('[Cloudinary] Error uploading multiple qualities:', error);
    throw error;
  }
};
