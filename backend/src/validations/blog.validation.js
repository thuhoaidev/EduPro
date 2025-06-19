const Joi = require('joi');

const createBlogSchema = Joi.object({
  title: Joi.string().max(200).required(),
  content: Joi.string().required(),
  image: Joi.string().allow(''),
  category: Joi.string().required(),
  status: Joi.string().valid('draft', 'published'),
});

const updateBlogSchema = Joi.object({
  title: Joi.string().max(200),
  content: Joi.string(),
  image: Joi.string().allow(''),
  category: Joi.string(),
  status: Joi.string().valid('draft', 'published'),
});

const commentSchema = Joi.object({
  content: Joi.string().required(),
});

const replySchema = Joi.object({
  content: Joi.string().required(),
});

module.exports = {
  createBlogSchema,
  updateBlogSchema,
  commentSchema,
  replySchema,
}; 