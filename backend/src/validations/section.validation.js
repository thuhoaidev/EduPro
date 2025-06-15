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

const updateSectionsOrderSchema = Joi.object({
  sections: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({
          'string.empty': 'ID chương học không được để trống',
          'any.required': 'ID chương học là bắt buộc',
        }),
        position: Joi.number().required().min(0).messages({
          'number.base': 'Vị trí phải là số',
          'number.min': 'Vị trí không được âm',
          'any.required': 'Vị trí là bắt buộc',
        }),
      }),
    )
    .required()
    .messages({
      'array.base': 'Danh sách chương học phải là mảng',
      'any.required': 'Danh sách chương học là bắt buộc',
    }),
});

module.exports = {
    createSectionSchema,
    updateSectionSchema,
    updateSectionsOrderSchema
}; 