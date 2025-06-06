const Joi = require('joi');

const createSectionSchema = Joi.object({
    course_id: Joi.string().required().messages({
        'string.empty': 'ID khóa học không được để trống',
        'any.required': 'ID khóa học là bắt buộc'
    }),
    title: Joi.string().required().trim().messages({
        'string.empty': 'Tiêu đề chương không được để trống',
        'any.required': 'Tiêu đề chương là bắt buộc'
    })
});

const updateSectionSchema = Joi.object({
    title: Joi.string().required().trim().messages({
        'string.empty': 'Tiêu đề chương không được để trống',
        'any.required': 'Tiêu đề chương là bắt buộc'
    })
});

module.exports = {
    createSectionSchema,
    updateSectionSchema
}; 