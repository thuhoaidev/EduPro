const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  updateLessonsOrderSchema,
} = require('../validations/lesson.validation');
const Course = require('../models/Course');

// Tạo bài học mới
exports.createLessons = async (req, res, next) => {
  try {
    const { lessons } = req.body;
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ success: false, message: 'Danh sách bài học không hợp lệ' });
    }

    const createdLessons = [];
    for (let i = 0; i < lessons.length; i++) {
      const { section_id, title, is_preview } = lessons[i];
      if (!section_id || !title) {
        return res
          .status(400)
          .json({ success: false, message: `Bài học thứ ${i + 1} thiếu section_id hoặc title` });
      }
      const section = await Section.findById(section_id);
      if (!section) {
        return res
          .status(404)
          .json({ success: false, message: `Không tìm thấy chương cho bài học thứ ${i + 1}` });
      }
      // Kiểm tra khóa học tồn tại
      const course = await Course.findById(section.course_id);
      if (!course) {
        return res
          .status(404)
          .json({ success: false, message: `Không tìm thấy khóa học cho bài học thứ ${i + 1}` });
      }
      // Kiểm tra quyền
      const userRoles = req.user.roles || [];
      if (!userRoles.includes('admin') && !userRoles.includes('instructor')) {
        return res
          .status(403)
          .json({ success: false, message: 'Không có quyền thực hiện chức năng này' });
      }
      if (userRoles.includes('instructor') && !userRoles.includes('admin')) {
        const InstructorProfile = require('../models/InstructorProfile');
        const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
        if (!instructorProfile) {
          return res.status(403).json({
            success: false,
            message: 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.',
          });
        }
        if (
          !course.instructor ||
          course.instructor.toString() !== instructorProfile._id.toString()
        ) {
          return res
            .status(403)
            .json({ success: false, message: 'Không có quyền thực hiện chức năng này' });
        }
      }
      // Validate dữ liệu
      const validatedData = await validateSchema(createLessonSchema, {
        section_id,
        title,
        is_preview,
      });
      // Tạo lesson mới
      const lesson = new Lesson(validatedData);
      await lesson.save();
      // Thêm lesson vào section
      section.lessons.push(lesson._id);
      await section.save();
      createdLessons.push(lesson);
    }
    res.status(201).json({
      success: true,
      data: createdLessons,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật bài học
exports.updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, is_preview } = req.body;

    // Tìm lesson để lấy section_id
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }
    // Tìm section để lấy course_id
    const section = await Section.findById(lesson.section_id);
    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương');
    }
    // Tìm course để kiểm tra instructor
    const course = await Course.findById(section.course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }
    // Kiểm tra quyền
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('admin') && !userRoles.includes('instructor')) {
      throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
    }
    if (userRoles.includes('instructor') && !userRoles.includes('admin')) {
      const InstructorProfile = require('../models/InstructorProfile');
      const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
      if (!instructorProfile) {
        throw new ApiError(
          403,
          'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.',
        );
      }
      if (!course.instructor || course.instructor.toString() !== instructorProfile._id.toString()) {
        throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
      }
    }
    // Validate dữ liệu
    const validatedData = await validateSchema(updateLessonSchema, { title, is_preview });
    // Cập nhật lesson
    const updatedLesson = await Lesson.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true },
    );
    res.json({
      success: true,
      data: updatedLesson,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa bài học
exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm lesson để lấy section_id
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Xóa lesson
    await Lesson.findByIdAndDelete(id);

    // Xóa lesson khỏi section
    await Section.findByIdAndUpdate(lesson.section_id, { $pull: { lessons: id } });

    res.json({
      success: true,
      message: 'Xóa bài học thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách bài học theo chương
exports.getLessonsBySection = async (req, res, next) => {
  try {
    const { section_id } = req.params;

    // Kiểm tra section tồn tại
    const section = await Section.findById(section_id);
    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương');
    }

    // Lấy danh sách bài học với thông tin video và quiz
    const lessons = await Lesson.find({ section_id }).sort({ position: 1 });

    // Lấy thông tin video và quiz cho từng lesson
    const Video = require('../models/Video');
    const Quiz = require('../models/Quiz');

    const lessonsWithDetails = await Promise.all(
      lessons.map(async lesson => {
        const videos = await Video.find({ lesson_id: lesson._id }).sort({ createdAt: 1 });
        const quiz = await Quiz.findOne({ lesson_id: lesson._id });

        return {
          ...lesson.toObject(),
          videos: videos.map(video => ({
            _id: video._id,
            url: video.url,
            duration: video.duration,
            description: video.description,
            status: video.status,
          })),
          quiz: quiz
            ? {
                _id: quiz._id,
                questions: quiz.questions,
              }
            : null,
        };
      }),
    );

    res.json({
      success: true,
      data: lessonsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật vị trí các bài học
exports.updateLessonsOrder = async (req, res, next) => {
  try {
    const { section_id } = req.params;
    const { lessons } = req.body;

    console.log('User:', req.user);
    console.log('User role:', req.user.role_id);

    // Kiểm tra section tồn tại
    const section = await Section.findById(section_id);
    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương học');
    }

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(section.course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra quyền
    const userRole = req.user.role_id;
    const userRoles = req.user.roles || [];
    console.log('User role:', userRole);
    console.log('User roles:', userRoles);
    console.log('Course instructor:', course.instructor);
    console.log('User ID:', req.user._id);

    if (!userRoles.includes('admin') && !userRoles.includes('instructor')) {
      throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
    }

    // Kiểm tra nếu là instructor thì phải là người tạo khóa học
    if (userRoles.includes('instructor') && !userRoles.includes('admin')) {
      // Cho phép nếu course.instructor trùng với _id của user hoặc _id của InstructorProfile
      let instructorProfileId = null;
      try {
        const InstructorProfile = require('../models/InstructorProfile');
        const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
        if (instructorProfile) instructorProfileId = instructorProfile._id.toString();
      } catch (e) {
        /* ignore */
      }
      if (
        !course.instructor ||
        (course.instructor.toString() !== req.user._id.toString() &&
          (!instructorProfileId || course.instructor.toString() !== instructorProfileId))
      ) {
        throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
      }
    }

    // Validate dữ liệu
    await validateSchema(updateLessonsOrderSchema, { lessons });

    // Cập nhật vị trí các bài học
    const updatePromises = lessons.map(({ id, position }) =>
      Lesson.findByIdAndUpdate(id, { position }, { new: true, runValidators: true }),
    );

    await Promise.all(updatePromises);

    // Lấy lại danh sách bài học đã cập nhật
    const updatedLessons = await Lesson.find({ section_id }).sort({ position: 1 });

    res.json({
      success: true,
      data: updatedLessons,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin 1 bài học theo id
exports.getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học' });
    }
    // Lấy thông tin video và quiz cho lesson này
    const Video = require('../models/Video');
    const Quiz = require('../models/Quiz');
    const videos = await Video.find({ lesson_id: lesson._id }).sort({ createdAt: 1 });
    const quiz = await Quiz.findOne({ lesson_id: lesson._id });
    res.json({
      success: true,
      data: {
        ...lesson.toObject(),
        videos: videos.map(video => ({
          _id: video._id,
          url: video.url,
          duration: video.duration,
          description: video.description,
          status: video.status,
        })),
        quiz: quiz
          ? {
              _id: quiz._id,
              questions: quiz.questions,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Xóa bài học
exports.deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm lesson để lấy section_id
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      throw new ApiError(404, 'Không tìm thấy bài học');
    }

    // Tìm section chứa lesson
    const section = await Section.findById(lesson.section_id);
    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương học');
    }

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(section.course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra quyền
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('admin') && !userRoles.includes('instructor')) {
      throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
    }

    // Kiểm tra nếu là instructor thì phải là người tạo khóa học
    if (userRoles.includes('instructor') && !userRoles.includes('admin')) {
      const InstructorProfile = require('../models/InstructorProfile');
      const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
      if (!instructorProfile) {
        throw new ApiError(
          403,
          'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.',
        );
      }
      if (!course.instructor || course.instructor.toString() !== instructorProfile._id.toString()) {
        throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
      }
    }

    // Xóa các video liên quan
    const Video = require('../models/Video');
    const videos = await Video.find({ lesson_id: lesson._id });
    for (const video of videos) {
      // Xóa file từ Cloudinary
      const { deleteFromCloudinary } = require('../utils/cloudinary');
      for (const quality in video.quality_urls) {
        const pubId = video.quality_urls[quality].public_id;
        if (pubId) await deleteFromCloudinary(pubId);
      }
      await video.deleteOne();
    }

    // Xóa quiz liên quan
    const Quiz = require('../models/Quiz');
    await Quiz.deleteMany({ lesson_id: lesson._id });

    // Xóa lesson khỏi section
    section.lessons = section.lessons.filter(lessonId => lessonId.toString() !== id);
    await section.save();

    // Xóa lesson
    await lesson.deleteOne();

    res.json({
      success: true,
      message: 'Xóa bài học thành công',
    });
  } catch (error) {
    next(error);
  }
};
