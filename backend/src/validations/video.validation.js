const Joi = require('joi');

const createVideoSchema = Joi.object({
  lesson_id: Joi.string().required().messages({
    'string.empty': 'ID bài học không được để trống',
    'any.required': 'ID bài học là bắt buộc',
  }),
  duration: Joi.number().required().min(0).messages({
    'number.base': 'Thời lượng phải là số',
    'number.min': 'Thời lượng không được âm',
    'any.required': 'Thời lượng là bắt buộc',
  }),
  description: Joi.string().allow('').optional().messages({
    'string.base': 'Mô tả phải là chuỗi',
  }),
  status: Joi.string().valid('draft', 'published', 'archived').default('draft').messages({
    'string.base': 'Trạng thái phải là chuỗi',
    'any.only': 'Trạng thái không hợp lệ',
  }),
  quality_urls: Joi.object().required().messages({
    'object.base': 'Danh sách video theo chất lượng không được để trống',
    'any.required': 'Danh sách video theo chất lượng là bắt buộc',
  }),
});

const updateVideoSchema = Joi.object({
  duration: Joi.number().min(0).messages({
    'number.base': 'Thời lượng phải là số',
    'number.min': 'Thời lượng không được âm',
  }),
  description: Joi.string().allow('').optional().messages({
    'string.base': 'Mô tả phải là chuỗi',
  }),
  status: Joi.string().valid('draft', 'published', 'archived').messages({
    'string.base': 'Trạng thái phải là chuỗi',
    'any.only': 'Trạng thái không hợp lệ',
  }),
  quality_urls: Joi.object().optional().messages({
    'object.base': 'Danh sách video theo chất lượng không hợp lệ',
  }),
});

module.exports = {
  createVideoSchema,
  updateVideoSchema,
};
