const Section = require('../models/Section');
const Course = require('../models/Course');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { createSectionSchema, updateSectionSchema, updateSectionsOrderSchema } = require('../validations/section.validation');

// Tạo chương mới
exports.createSection = async (req, res, next) => {
    try {
        const { course_id, title } = req.body;

        // Kiểm tra khóa học tồn tại
        const course = await Course.findById(course_id);
        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Validate dữ liệu
        const validatedData = await validateSchema(createSectionSchema, { course_id, title });

        // Tạo section mới
        const section = new Section(validatedData);
        await section.save();

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// Cập nhật chương
exports.updateSection = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        // Validate dữ liệu
        const validatedData = await validateSchema(updateSectionSchema, { title });

        // Cập nhật section
        const section = await Section.findByIdAndUpdate(
            id,
            { $set: validatedData },
            { new: true, runValidators: true }
        );

        if (!section) {
            throw new ApiError(404, 'Không tìm thấy chương');
        }

        res.json({
            success: true,
            data: section
        });
    } catch (error) {
        next(error);
    }
};

// Xóa chương
exports.deleteSection = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Xóa section
        const section = await Section.findByIdAndDelete(id);
        if (!section) {
            throw new ApiError(404, 'Không tìm thấy chương');
        }

        res.json({
            success: true,
            message: 'Xóa chương thành công'
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
                select: 'title position is_preview',
                options: { sort: { position: 1 } }
            });

        res.json({
            success: true,
            data: sections
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
            if (!course.instructor_id || course.instructor_id.toString() !== req.user._id.toString()) {
                throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
            }
        }

        // Validate dữ liệu
        await validateSchema(updateSectionsOrderSchema, { sections });

        // Cập nhật vị trí các chương học
        const updatePromises = sections.map(({ id, position }) =>
            Section.findByIdAndUpdate(
                id,
                { position },
                { new: true, runValidators: true },
            ),
        );

        await Promise.all(updatePromises);

        // Lấy lại danh sách chương học đã cập nhật
        const updatedSections = await Section.find({ course_id })
            .sort({ position: 1 })
            .populate({
                path: 'lessons',
                select: 'title position is_preview',
                options: { sort: { position: 1 } },
            });

        res.json({
            success: true,
            data: updatedSections,
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