const Joi = require('joi');

const getRevenueData = {
  query: Joi.object().keys({
    days: Joi.number().integer().min(1).max(365).default(30),
  }),
};

const getTopCourses = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).default(5),
  }),
};

const getMonthlyStatistics = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2020).max(2030).default(new Date().getFullYear()),
  }),
};

module.exports = {
  getRevenueData,
  getTopCourses,
  getMonthlyStatistics,
}; 