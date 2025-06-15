const Joi = require('joi');

const questionSchema = Joi.object({
  question: Joi.string().required().messages({
    'string.empty': 'Câu hỏi không được để trống',
    'any.required': 'Câu hỏi không được để trống',
  }),
  options: Joi.array().items(Joi.string()).min(2).required().messages({
    'array.min': 'Phải có ít nhất 2 lựa chọn',
    'any.required': 'Danh sách lựa chọn không được để trống',
  }),
  correct_answer: Joi.string().required().messages({
    'string.empty': 'Đáp án không được để trống',
    'any.required': 'Đáp án không được để trống',
  }),
  explanation: Joi.string().required().messages({
    'string.empty': 'Giải thích không được để trống',
    'any.required': 'Giải thích không được để trống',
  }),
});

const createQuizSchema = Joi.object({
  lesson_id: Joi.string().required().messages({
    'string.empty': 'Bài học không được để trống',
    'any.required': 'Bài học không được để trống',
  }),
  title: Joi.string().required().messages({
    'string.empty': 'Tiêu đề không được để trống',
    'any.required': 'Tiêu đề không được để trống',
  }),
  description: Joi.string().allow(''),
  questions: Joi.array().items(questionSchema).min(1).required().messages({
    'array.min': 'Phải có ít nhất 1 câu hỏi',
    'any.required': 'Danh sách câu hỏi không được để trống',
  }),
  time_limit: Joi.number().min(1).default(15),
  passing_score: Joi.number().min(0).max(100).default(70),
});

const updateQuizSchema = Joi.object({
  title: Joi.string().messages({
    'string.empty': 'Tiêu đề không được để trống',
  }),
  description: Joi.string().allow(''),
  questions: Joi.array().items(questionSchema).min(1).messages({
    'array.min': 'Phải có ít nhất 1 câu hỏi',
  }),
  time_limit: Joi.number().min(1),
  passing_score: Joi.number().min(0).max(100),
});

module.exports = {
  createQuizSchema,
  updateQuizSchema,
}; 