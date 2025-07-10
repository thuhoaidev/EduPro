const mongoose = require('mongoose');

const getUserId = (req) => {
  if (req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
    return req.user.id;
  }
  if (req.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
    return req.user._id.toString();
  }
  return null;
};

module.exports = getUserId;
