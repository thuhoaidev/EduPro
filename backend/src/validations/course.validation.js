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
        .messages({
            'string.empty': 'Ngôn ngữ không được để trống',
            'any.required': 'Ngôn ngữ là bắt buộc'
        }),
    price: Joi.number()
        .required()
        .min(0)
        .messages({
            'number.base': 'Giá phải là số',
            'number.min': 'Giá không được âm',
            'any.required': 'Giá là bắt buộc'
        }),
    discount: Joi.number()
        .min(0)
        .max(100)
        .default(0)
        .messages({
            'number.base': 'Giảm giá phải là số',
            'number.min': 'Giảm giá không được âm',
            'number.max': 'Giảm giá không được vượt quá 100%'
        }),
    requirements: Joi.array()
        .items(Joi.string().min(3))
        .min(1)
        .messages({
            'array.min': 'Phải có ít nhất 1 yêu cầu',
            'array.base': 'Yêu cầu phải là một mảng'
        })
});

const updateCourseSchema = createCourseSchema.fork(
    ['title', 'description', 'category', 'level', 'language', 'price', 'requirements'],
    schema => schema.optional()
);

const updateCourseStatusSchema = Joi.object({
    status: Joi.string()
        .required()
        .valid('draft', 'published', 'archived')
        .messages({
            'any.only': 'Trạng thái phải là draft, published hoặc archived',
            'any.required': 'Trạng thái là bắt buộc'
        })
});

module.exports = {
    createCourseSchema,
    updateCourseSchema,
    updateCourseStatusSchema
}; 