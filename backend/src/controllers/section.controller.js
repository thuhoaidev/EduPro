const Section = require('../models/Section');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const {
  createSectionSchema,
  updateSectionSchema,
  updateSectionsOrderSchema,
} = require('../validations/section.validation');
const Video = require('../models/Video');
const Quiz = require('../models/Quiz');

// Tạo chương mới
exports.createSection = async (req, res, next) => {
  try {
    const { course_id, title, status } = req.body;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Validate dữ liệu
    const validatedData = await validateSchema(createSectionSchema, { course_id, title, status });

    // Tạo section mới
    const section = new Section(validatedData);
    await section.save();

    res.status(201).json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật chương
exports.updateSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    // Validate dữ liệu
    const validatedData = await validateSchema(updateSectionSchema, { title, description, status });

    // Cập nhật section
    const section = await Section.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true },
    );

    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương');
    }

    console.log('Updated section:', {
      id: section._id,
      title: section.title,
      status: section.status,
      validatedData: validatedData
    });

    res.json({
      success: true,
      data: section,
    });
  } catch (error) {
    next(error);
  }
};

// Xóa chương
exports.deleteSection = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm section để lấy thông tin
    const section = await Section.findById(id);
    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương');
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

    // Lấy tất cả lesson trong section
    const Lesson = require('../models/Lesson');
    const lessons = await Lesson.find({ section_id: section._id });

    // Xóa tất cả video và quiz liên quan đến các lesson
    for (const lesson of lessons) {
      // Xóa video liên quan
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
      await Quiz.deleteMany({ lesson_id: lesson._id });
    }

    // Xóa tất cả lesson trong section
    await Lesson.deleteMany({ section_id: section._id });

    // Xóa section
    await section.deleteOne();

    res.json({
      success: true,
      message: 'Xóa chương thành công',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách chương theo khóa học
exports.getSectionsByCourse = async (req, res, next) => {
  try {
    const { course_id } = req.params;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Lấy danh sách chương
    const sections = await Section.find({ course_id })
      .sort({ position: 1 })
      .populate({
        path: 'lessons',
        select: 'title position is_preview status',
        options: { sort: { position: 1 } },
      });

    // Lấy thông tin video và quiz cho từng lesson
    const sectionsWithDetails = await Promise.all(
      sections.map(async section => {
        const lessonsWithDetails = await Promise.all(
          section.lessons.map(async lesson => {
            const videos = await Video.find({ lesson_id: lesson._id }).sort({ createdAt: 1 });
            const quiz = await Quiz.findOne({ lesson_id: lesson._id });

            if (videos.length > 0) {
              console.log('Lesson:', lesson._id, 'Videos count:', videos.length);
            } else {
              console.log('Lesson:', lesson._id, 'No videos');
            }

            if (quiz) {
              console.log('Lesson:', lesson._id, 'Quiz questions:', quiz.questions.length);
            } else {
              console.log('Lesson:', lesson._id, 'No quiz');
            }

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
        return {
          ...section.toObject(),
          lessons: lessonsWithDetails,
        };
      }),
    );

    res.json({
      success: true,
      data: sectionsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật vị trí các chương học
exports.updateSectionsOrder = async (req, res, next) => {
  try {
    const { course_id } = req.params;
    const { sections } = req.body;

    // Kiểm tra quyền
    const userRole = req.user.role_id;
    if (!userRole || !['admin', 'instructor'].includes(userRole.name)) {
      throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
    }

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra nếu là instructor thì phải là người tạo khóa học
    if (userRole.name === 'instructor') {
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
    await validateSchema(updateSectionsOrderSchema, { sections });

    // Cập nhật vị trí các chương học
    const updatePromises = sections.map(({ id, position }) =>
      Section.findByIdAndUpdate(id, { position }, { new: true, runValidators: true }),
    );

    await Promise.all(updatePromises);

    // Lấy lại danh sách chương học đã cập nhật
    const updatedSections = await Section.find({ course_id })
      .sort({ position: 1 })
      .populate({
        path: 'lessons',
        select: 'title position is_preview status',
        options: { sort: { position: 1 } },
      });

    // Lấy thông tin video và quiz cho từng lesson
    const sectionsWithDetails = await Promise.all(
      updatedSections.map(async section => {
        const lessonsWithDetails = await Promise.all(
          section.lessons.map(async lesson => {
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

        return {
          ...section.toObject(),
          lessons: lessonsWithDetails,
        };
      }),
    );

    res.json({
      success: true,
      data: sectionsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin 1 section theo id
exports.getSectionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) {
      throw new ApiError(404, 'Không tìm thấy chương');
    }
    res.json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};
