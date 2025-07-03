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

        // Kiểm tra section tồn tại
        const section = await Section.findById(section_id);
        if (!section) {
            throw new ApiError(404, 'Không tìm thấy chương');
        }

        // Validate dữ liệu
        const validatedData = await validateSchema(createLessonSchema, { section_id, title, is_preview });

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

        // Validate dữ liệu
        const validatedData = await validateSchema(updateLessonSchema, { title, is_preview });

        // Cập nhật lesson
        const lesson = await Lesson.findByIdAndUpdate(
            id,
            { $set: validatedData },
            { new: true, runValidators: true }
        );

        if (!lesson) {
            throw new ApiError(404, 'Không tìm thấy bài học');
        }

        res.json({
            success: true,
            data: lesson
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

        // Lấy danh sách bài học
        const lessons = await Lesson.find({ section_id })
            .sort({ position: 1 });

        res.json({
            success: true,
            data: lessons
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
        console.log('User role name:', userRole?.name);
        console.log('Course instructor:', course.instructor_id);
        console.log('User ID:', req.user._id);

        if (!userRole || !['admin', 'instructor'].includes(userRole.name)) {
            throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
        }

        // Kiểm tra nếu là instructor thì phải là người tạo khóa học
        if (userRole.name === 'instructor') {
            if (!course.instructor_id || course.instructor_id.toString() !== req.user._id.toString()) {
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
    res.json({ success: true, data: lesson });
  } catch (error) {
    next(error);
  }
}; 