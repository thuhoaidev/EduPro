const Video = require('../models/Video');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createVideoSchema, updateVideoSchema } = require('../validations/video.validation');
const { uploadBufferToCloudinary, getPublicIdFromUrl, deleteFromCloudinary } = require('../utils/cloudinary');

// Tạo video mới
exports.createVideo = async (req, res, next) => {
  try {
    const { lesson_id, duration } = req.body;

    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Kiểm tra lesson đã có video chưa
    const existingVideo = await Video.findOne({ lesson_id });
    if (existingVideo) {
      throw new ApiError(400, 'Bài học này đã có video');
    }

    // Kiểm tra file video
    if (!req.file || !req.file.buffer) {
      throw new ApiError(400, 'Vui lòng tải lên video');
    }

    // Upload video lên Cloudinary
    let videoUrl = '';
    let publicId = '';
    try {
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'videos');
      videoUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } catch (uploadError) {
      console.error('Lỗi upload video:', uploadError);
      throw new ApiError(500, 'Lỗi khi tải lên video: ' + uploadError.message);
    }

    // Validate dữ liệu
    const validatedData = await validateSchema(createVideoSchema, {
      lesson_id,
      url: videoUrl,
      duration: parseInt(duration) || 0,
      public_id: publicId,
    });

    // Tạo video mới
    const video = new Video(validatedData);
    await video.save();

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật video
exports.updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration } = req.body;

    // Tìm video cũ
    const oldVideo = await Video.findById(id);
    if (!oldVideo) {
      throw new ApiError(404, 'Không tìm thấy video');
    }

    // Xử lý video mới nếu có
    let videoUrl = oldVideo.url;
    let publicId = oldVideo.public_id;
    if (req.file && req.file.buffer) {
      try {
        // Xóa video cũ trên Cloudinary nếu có
        if (oldVideo.public_id) {
          await deleteFromCloudinary(oldVideo.public_id);
        }

        // Upload video mới
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'videos');
        videoUrl = uploadResult.secure_url;
        publicId = uploadResult.public_id;
      } catch (uploadError) {
        console.error('Lỗi upload video:', uploadError);
        throw new ApiError(500, 'Lỗi khi tải lên video: ' + uploadError.message);
      }
    }

    // Validate dữ liệu
    const validatedData = await validateSchema(updateVideoSchema, {
      url: videoUrl,
      duration: duration ? parseInt(duration) : oldVideo.duration,
      public_id: publicId,
    });

    // Cập nhật video
    const video = await Video.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa video
exports.deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm video
    const video = await Video.findById(id);
    if (!video) {
      throw new ApiError(404, 'Không tìm thấy video');
    }

    // Xóa video trên Cloudinary nếu có
    if (video.public_id) {
      await deleteFromCloudinary(video.public_id);
    }

    // Xóa video trong database
    await video.deleteOne();

    res.json({
      success: true,
      message: 'Xóa video thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy video theo bài học
exports.getVideoByLesson = async (req, res, next) => {
  try {
    const { lesson_id } = req.params;

    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Lấy video
    const video = await Video.findOne({ lesson_id });
    if (!video) {
      throw new ApiError(404, 'Không tìm thấy video');
    }

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
}; 