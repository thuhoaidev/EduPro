const Category = require('../models/Category');
const { validateSchema } = require('../utils/validateSchema');
const { createCategorySchema, updateCategorySchema } = require('../validations/category.validation');
const ApiError = require('../utils/ApiError');

// Tạo danh mục mới
exports.createCategory = async (req, res, next) => {
    try {
        const validatedData = await validateSchema(createCategorySchema, req.body);

        const category = new Category(validatedData);
        await category.save();

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        // Xử lý lỗi trùng lặp tên danh mục
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return next(new ApiError(400, 'Tên danh mục đã tồn tại'));
        }
        next(error);
    }
};

// Lấy danh sách danh mục (phẳng)
exports.getCategories = async (req, res, next) => {
    try {
        // Lấy tất cả danh mục mà không populate children vì trường parent đã bị xóa
        const categories = await Category.find();

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách danh mục theo trạng thái
exports.getCategoriesByStatus = async (req, res, next) => {
    try {
        const { status } = req.params;
        
        // Kiểm tra giá trị status có hợp lệ không
        if (!['active', 'inactive'].includes(status.toLowerCase())) {
            throw new ApiError(400, 'Trạng thái không hợp lệ. Phải là active hoặc inactive');
        }

        const categories = await Category.find({ status: status.toLowerCase() });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết danh mục
exports.getCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        // Không populate children vì trường parent đã bị xóa
        const category = await Category.findById(id);

        if (!category) {
            throw new ApiError(404, 'Không tìm thấy danh mục');
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        // Kiểm tra danh mục có tồn tại không
        const category = await Category.findById(id);
        if (!category) {
            throw new ApiError(404, 'Danh mục không tồn tại');
        }

        // Kiểm tra xem có cập nhật tên không
        if (name && name !== category.name) {
            // Kiểm tra xem tên mới đã tồn tại chưa
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                throw new ApiError(400, 'Tên danh mục đã tồn tại');
            }
        }

        // Cập nhật thông tin
        if (name) category.name = name;
        if (description !== undefined) category.description = description;

        // Cập nhật trạng thái nếu có
        if (status !== undefined) {
            // Kiểm tra giá trị status có hợp lệ không
            if (!['active', 'inactive'].includes(status.toLowerCase())) {
                throw new ApiError(400, 'Trạng thái không hợp lệ. Phải là active hoặc inactive');
            }
            category.status = status.toLowerCase();
        }

        await category.save();

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// Xóa danh mục
exports.deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem danh mục có khóa học nào không
        const Course = require('../models/Course'); // Import Course để kiểm tra
        const coursesInCategory = await Course.countDocuments({ category: id });
        if (coursesInCategory > 0) {
            throw new ApiError(400, 'Không thể xóa danh mục đang chứa khóa học');
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            throw new ApiError(404, 'Không tìm thấy danh mục');
        }

        res.json({
            success: true,
            message: 'Xóa danh mục thành công'
        });
    } catch (error) {
        next(error);
    }
}; 