const Joi = require('joi');

const createVideoSchema = Joi.object({
  lesson_id: Joi.string().required().messages({
    'string.empty': 'ID bài học không được để trống',
    'any.required': 'ID bài học là bắt buộc',
  }),
  url: Joi.string().required().trim().messages({
    'string.empty': 'URL video không được để trống',
    'any.required': 'URL video là bắt buộc',
  }),
  duration: Joi.number().required().min(0).messages({
    'number.base': 'Thời lượng phải là số',
    'number.min': 'Thời lượng không được âm',
    'any.required': 'Thời lượng là bắt buộc',
  }),
});

const updateVideoSchema = Joi.object({
  url: Joi.string().trim().messages({
    'string.empty': 'URL video không được để trống',
  }),
  duration: Joi.number().min(0).messages({
    'number.base': 'Thời lượng phải là số',
    'number.min': 'Thời lượng không được âm',
  }),
});

module.exports = {
  createVideoSchema,
  updateVideoSchema,
}; 