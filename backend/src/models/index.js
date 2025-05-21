const mongoose = require('mongoose');
const User = require('./user/User');

// Export các models
module.exports = {
  mongoose,
  User,
}; 