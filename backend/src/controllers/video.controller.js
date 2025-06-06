const Video = require('../models/Video');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createVideoSchema, updateVideoSchema } = require('../validations/video.validation');

// Tạo video mới
exports.createVideo = async (req, res, next) => {
  try {
    const { lesson_id, url, duration } = req.body;

    // Kiểm tra lesson tồn tại
    const lesson = await Lesson.findById(lesson_id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Validate dữ liệu
    const validatedData = await validateSchema(createVideoSchema, { lesson_id, url, duration });

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
    const { url, duration } = req.body;

    // Validate dữ liệu
    const validatedData = await validateSchema(updateVideoSchema, { url, duration });

    // Cập nhật video
    const video = await Video.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true },
    );

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

// Xóa video
exports.deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Xóa video
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      throw new ApiError(404, 'Không tìm thấy video');
    }

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

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
}; 