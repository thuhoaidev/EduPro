const Joi = require('joi');

const createCourseSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(3)
        .max(200)
        .messages({
            'string.empty': 'Tiêu đề không được để trống',
            'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
            'string.max': 'Tiêu đề không được vượt quá 200 ký tự',
            'any.required': 'Tiêu đề là bắt buộc'
        }),
    description: Joi.string()
        .required()
        .min(10)
        .messages({
            'string.empty': 'Mô tả không được để trống',
            'string.min': 'Mô tả phải có ít nhất 10 ký tự',
            'any.required': 'Mô tả là bắt buộc'
        }),
    category: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.empty': 'Danh mục không được để trống',
            'string.pattern.base': 'Danh mục không hợp lệ',
            'any.required': 'Danh mục là bắt buộc'
        }),
    level: Joi.string()
        .required()
        .valid('beginner', 'intermediate', 'advanced')
        .messages({
            'any.only': 'Trình độ phải là beginner, intermediate hoặc advanced',
            'any.required': 'Trình độ là bắt buộc'
        }),
    language: Joi.string()
        .required()
        .valid('vi', 'en', 'Vietnamese', 'English')
        .messages({
            'string.empty': 'Ngôn ngữ không được để trống',
            'any.only': 'Ngôn ngữ phải là Vietnamese hoặc English',
            'any.required': 'Ngôn ngữ là bắt buộc'
        }),
    price: Joi.number()
        .required()
        .integer()
        .min(0)
        .max(100000000)
        .messages({
            'number.base': 'Giá phải là số nguyên',
            'number.integer': 'Giá phải là số nguyên',
            'number.min': 'Giá không được âm',
            'number.max': 'Giá không được vượt quá 100 triệu',
            'any.required': 'Giá là bắt buộc'
        }),
    discount_amount: Joi.number()
        .min(0)
        .default(0)
        .messages({
            'number.base': 'Giảm giá theo số tiền phải là số',
            'number.min': 'Giảm giá theo số tiền không được âm'
        }),
    discount_percentage: Joi.number()
        .min(0)
        .max(100)
        .default(0)
        .messages({
            'number.base': 'Giảm giá theo phần trăm phải là số',
            'number.min': 'Giảm giá theo phần trăm không được âm',
            'number.max': 'Giảm giá theo phần trăm không được vượt quá 100%'
        }),
    requirements: Joi.array()
        .items(Joi.string().min(3))
        .min(1)
        .messages({
            'array.min': 'Phải có ít nhất 1 yêu cầu',
            'array.base': 'Yêu cầu phải là một mảng'
        }),
    thumbnail: Joi.string()
        .required()
        .uri()
        .messages({
            'string.empty': 'Ảnh đại diện không được để trống',
            'string.uri': 'URL ảnh đại diện không hợp lệ',
            'any.required': 'Ảnh đại diện là bắt buộc'
        }),
    instructor: Joi.string()
        .required()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.empty': 'Giảng viên không được để trống',
            'string.pattern.base': 'ID giảng viên không hợp lệ',
            'any.required': 'Giảng viên là bắt buộc'
        })
});

const updateCourseSchema = createCourseSchema.fork(
    ['title', 'description', 'category', 'level', 'language', 'price', 'requirements', 'discount_amount', 'discount_percentage'],
    schema => schema.optional()
);

const updateCourseStatusSchema = Joi.object({
    status: Joi.string()
        .valid('draft', 'pending', 'approved', 'rejected')
        .messages({
            'any.only': 'Trạng thái phải là draft, pending, approved hoặc rejected'
        }),
    displayStatus: Joi.string()
        .valid('hidden', 'published')
        .messages({
            'any.only': 'Trạng thái hiển thị phải là hidden hoặc published'
        })
}).or('status', 'displayStatus');

module.exports = {
    createCourseSchema,
    updateCourseSchema,
    updateCourseStatusSchema
}; 