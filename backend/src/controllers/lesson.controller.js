const Lesson = require('../models/Lesson');
const Section = require('../models/Section');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createLessonSchema, updateLessonSchema, reorderLessonsSchema, updateLessonsOrderSchema } = require('../validations/lesson.validation');
const Course = require('../models/Course');

// Tạo bài học mới
exports.createLesson = async (req, res, next) => {
    try {
        const { section_id, title, is_preview } = req.body;

        console.log('Creating lesson with data:', { section_id, title, is_preview });
        console.log('User:', req.user);

        // Kiểm tra section tồn tại
        const section = await Section.findById(section_id);
        if (!section) {
            throw new ApiError(404, 'Không tìm thấy chương');
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

        // Kiểm tra nếu là instructor thì phải là người tạo khóa học (so sánh instructorProfile)
        if (userRoles.includes('instructor') && !userRoles.includes('admin')) {
            const InstructorProfile = require('../models/InstructorProfile');
            const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
            if (!instructorProfile) {
                throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.');
            }
            if (!course.instructor || course.instructor.toString() !== instructorProfile._id.toString()) {
                throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
            }
        }

        // Validate dữ liệu
        const validatedData = await validateSchema(createLessonSchema, { section_id, title, is_preview });
        console.log('Validated data:', validatedData);

        // Tạo lesson mới
        const lesson = new Lesson(validatedData);
        await lesson.save();

        // Thêm lesson vào section
        section.lessons.push(lesson._id);
        await section.save();

        res.status(201).json({
            success: true,
            data: lesson
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
                throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.');
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
            { new: true, runValidators: true }
        );
        res.json({
            success: true,
            data: updatedLesson
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
        await Section.findByIdAndUpdate(
            lesson.section_id,
            { $pull: { lessons: id } }
        );

        res.json({
            success: true,
            message: 'Xóa bài học thành công'
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
        const lessons = await Lesson.find({ section_id })
            .sort({ position: 1 });

        // Lấy thông tin video và quiz cho từng lesson
        const Video = require('../models/Video');
        const Quiz = require('../models/Quiz');
        
        const lessonsWithDetails = await Promise.all(
            lessons.map(async (lesson) => {
                const video = await Video.findOne({ lesson_id: lesson._id });
                const quiz = video ? await Quiz.findOne({ video_id: video._id }) : null;
                
                return {
                    ...lesson.toObject(),
                    video: video ? {
                        _id: video._id,
                        url: video.url,
                        duration: video.duration
                    } : null,
                    quiz: quiz ? {
                        _id: quiz._id,
                        questions: quiz.questions
                    } : null
                };
            })
        );

        res.json({
            success: true,
            data: lessonsWithDetails
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
            if (!course.instructor || course.instructor.toString() !== req.user._id.toString()) {
                throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
            }
        }

        // Validate dữ liệu
        await validateSchema(updateLessonsOrderSchema, { lessons });

        // Cập nhật vị trí các bài học
        const updatePromises = lessons.map(({ id, position }) =>
            Lesson.findByIdAndUpdate(
                id,
                { position },
                { new: true, runValidators: true },
            ),
        );

        await Promise.all(updatePromises);

        // Lấy lại danh sách bài học đã cập nhật
        const updatedLessons = await Lesson.find({ section_id })
            .sort({ position: 1 });

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
    const video = await Video.findOne({ lesson_id: lesson._id });
    const quiz = video ? await Quiz.findOne({ video_id: video._id }) : null;
    res.json({
      success: true,
      data: {
        ...lesson.toObject(),
        video: video ? {
          _id: video._id,
          url: video.url,
          duration: video.duration
        } : null,
        quiz: quiz ? {
          _id: quiz._id,
          questions: quiz.questions
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
}; 