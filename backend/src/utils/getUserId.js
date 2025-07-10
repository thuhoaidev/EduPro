const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const getUserId = (req) => {
  // Ưu tiên lấy từ middleware đã gán
  if (req?.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
    return req.user.id.toString();
  }

  if (req?.user?._id && mongoose.Types.ObjectId.isValid(req.user._id)) {
    return req.user._id.toString();
  }

  // Fallback: Nếu chưa có req.user, tự trích xuất từ token
  const authHeader = req.headers?.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const fallbackId = decoded.id || decoded._id || decoded.sub;
    if (mongoose.Types.ObjectId.isValid(fallbackId)) {
      return fallbackId.toString();
    }
  } catch (error) {
    console.warn('⚠️ Token không hợp lệ khi fallback getUserId:', error.message);
    return null;
  }

  return null;
};

module.exports = getUserId;
