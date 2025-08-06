const Video = require('../models/Video');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createVideoSchema, updateVideoSchema } = require('../validations/video.validation');
const {
  uploadMultipleQualitiesToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinary');

// Tạo video mới với nhiều chất lượng
exports.createVideo = async (req, res, next) => {
  try {
    const { lesson_id, duration, description, status } = req.body;

    // Kiểm tra lesson
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Cho phép nhiều video cho một bài học
    // Không cần kiểm tra existing video nữa

    // Kiểm tra file
    if (!req.file || !req.file.buffer) {
      throw new ApiError(400, 'Vui lòng tải lên file video');
    }

    // Upload lên cloud (360p, 720p, 1080p)
    const qualityUrls = await uploadMultipleQualitiesToCloudinary(req.file.buffer);

    // Validate dữ liệu
    const validatedData = await validateSchema(createVideoSchema, {
      lesson_id,
      duration: parseInt(duration) || 0,
      description: description || '',
      status: status || 'draft',
      quality_urls: qualityUrls,
    });

    // Lưu DB
    const video = new Video(validatedData);
    await video.save();

    res.status(201).json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

// Cập nhật video
exports.updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration, description, status } = req.body;

    const oldVideo = await Video.findById(id);
    if (!oldVideo) {
      throw new ApiError(404, 'Không tìm thấy video');
    }

    let newQualityUrls = oldVideo.quality_urls;

    // Nếu có file mới thì upload và xóa file cũ
    if (req.file && req.file.buffer) {
      // Xóa các bản cũ trên Cloudinary
      for (const quality in oldVideo.quality_urls) {
        const pubId = oldVideo.quality_urls[quality].public_id;
        if (pubId) await deleteFromCloudinary(pubId);
      }

      newQualityUrls = await uploadMultipleQualitiesToCloudinary(req.file.buffer);
    }

    const validatedData = await validateSchema(updateVideoSchema, {
      duration: duration ? parseInt(duration) : oldVideo.duration,
      description: description !== undefined ? description : oldVideo.description,
      status: status !== undefined ? status : oldVideo.status,
      quality_urls: newQualityUrls,
    });

    const updatedVideo = await Video.findByIdAndUpdate(
      id,
      { $set: validatedData },
      {
        new: true,
        runValidators: true,
      },
    );

    res.json({ success: true, data: updatedVideo });
  } catch (error) {
    next(error);
  }
};

// Xóa video
exports.deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
      throw new ApiError(404, 'Không tìm thấy video');
    }

    // Xóa tất cả public_id của các chất lượng
    for (const quality in video.quality_urls) {
      const pubId = video.quality_urls[quality].public_id;
      if (pubId) await deleteFromCloudinary(pubId);
    }

    await video.deleteOne();

    res.json({ success: true, message: 'Xóa video thành công' });
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả video theo bài học
exports.getVideoByLesson = async (req, res, next) => {
  try {
    const { lesson_id } = req.params;
    console.log('Looking for videos with lesson_id:', lesson_id);

    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) throw new ApiError(404, 'Không tìm thấy bài học');

    const videos = await Video.find({ lesson_id }).sort({ createdAt: 1 });
    console.log('Found videos count:', videos.length);

    res.json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};
