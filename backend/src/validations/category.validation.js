const Joi = require('joi');

const createCategorySchema = Joi.object({
    name: Joi.string()
        .required()
        .min(3)
        .max(100)
        .messages({
            'string.empty': 'Tên danh mục không được để trống',
            'string.min': 'Tên danh mục phải có ít nhất 3 ký tự',
            'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
            'any.required': 'Tên danh mục là bắt buộc'
        }),
    description: Joi.string()
        .allow('') // Cho phép rỗng
        .messages({
            'string.base': 'Mô tả phải là chuỗi'
        }),
    status: Joi.string()
        .valid('active', 'inactive')
        .default('active')
        .messages({
            'string.valid': 'Trạng thái phải là "active" hoặc "inactive"'
        }),
    parent: Joi.string()
        .allow(null) // Cho phép null
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID danh mục cha không hợp lệ'
        })
});

const updateCategorySchema = createCategorySchema.fork(
    ['name', 'description', 'status', 'parent'],
    schema => schema.optional()
);

module.exports = {
    createCategorySchema,
    updateCategorySchema
}; 