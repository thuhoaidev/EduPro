const Joi = require('joi');

const createLessonSchema = Joi.object({
    section_id: Joi.string().required().messages({
        'string.empty': 'ID chương không được để trống',
        'any.required': 'ID chương là bắt buộc'
    }),
    title: Joi.string().required().trim().messages({
        'string.empty': 'Tiêu đề bài học không được để trống',
        'any.required': 'Tiêu đề bài học là bắt buộc'
    }),
    is_preview: Joi.boolean().default(false)
});

const updateLessonSchema = Joi.object({
    title: Joi.string().required().trim().messages({
        'string.empty': 'Tiêu đề bài học không được để trống',
        'any.required': 'Tiêu đề bài học là bắt buộc'
    }),
    is_preview: Joi.boolean()
});

const reorderLessonsSchema = Joi.object({
    lessons: Joi.array().items(
        Joi.object({
            id: Joi.string().required().messages({
                'string.empty': 'ID bài học không được để trống',
                'any.required': 'ID bài học là bắt buộc'
            })
        })
    ).required().messages({
        'array.base': 'Danh sách bài học phải là một mảng',
        'any.required': 'Danh sách bài học là bắt buộc'
    })
});

const updateLessonsOrderSchema = Joi.object({
  lessons: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({
          'string.empty': 'ID bài học không được để trống',
          'any.required': 'ID bài học là bắt buộc',
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
      'array.base': 'Danh sách bài học phải là mảng',
      'any.required': 'Danh sách bài học là bắt buộc',
    }),
});

module.exports = {
    createLessonSchema,
    updateLessonSchema,
    reorderLessonsSchema,
    updateLessonsOrderSchema
}; 