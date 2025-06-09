const Joi = require('joi');

// Schema đăng nhập
exports.loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Email hoặc nickname là bắt buộc',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc',
    }),
});

// Schema đăng ký
exports.registerSchema = Joi.object({
  nickname: Joi.string()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.min': 'Nickname phải có ít nhất 3 ký tự',
      'string.max': 'Nickname không được vượt quá 30 ký tự',
      'any.required': 'Nickname là bắt buộc'
    }),
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'vn', 'net', 'org', 'edu'] } })
    .required()
    .messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
  role: Joi.string()
    .valid('student', 'instructor', 'admin')
    .optional()
    .messages({
      'any.only': 'Vai trò không hợp lệ'
    }),
  fullname: Joi.string()
    .min(2)
    .optional()
    .messages({
      'string.min': 'Họ và tên phải có ít nhất 2 ký tự'
    }),
  fullName: Joi.string()
    .min(2)
    .optional()
    .messages({
      'string.min': 'Họ và tên phải có ít nhất 2 ký tự'
    })
});