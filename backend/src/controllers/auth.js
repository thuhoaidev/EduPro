const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user/User');
const EmailVerification = require('../models/auth/EmailVerification');
const { ROLES } = require('../constants/roles');
const { sendVerificationEmail } = require('../services/emailService');

// Đăng ký tài khoản mới
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Tạo người dùng mới
    const user = await User.create({
      name,
      email,
      password,
      role: ROLES.STUDENT, // Mặc định là học viên
    });

    // Tạo token xác thực
    const token = generateVerificationToken();
    await EmailVerification.create({
      userId: user._id,
      token,
    });

    // Tạo URL xác thực
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // Gửi email xác thực
    await sendVerificationEmail(user.email, user.name, verificationUrl);

    // Tạo token đăng nhập
    const authToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
        },
        token: authToken,
      },
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

// Lấy thông tin người dùng
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

// Cập nhật thông tin người dùng
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    // Cập nhật thông tin
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified,
          status: user.status,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi cập nhật:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

// Tạo token xác thực email
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Gửi email xác thực
const sendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được xác thực',
      });
    }

    // Tạo token mới
    const token = generateVerificationToken();
    
    // Lưu token vào database
    await EmailVerification.create({
      userId: user._id,
      token,
    });

    // Tạo URL xác thực
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    // Gửi email
    const emailSent = await sendVerificationEmail(user.email, user.name, verificationUrl);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email xác thực',
      });
    }

    res.json({
      success: true,
      message: 'Email xác thực đã được gửi',
    });
  } catch (error) {
    console.error('Lỗi gửi email xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

// Xác thực email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    // Tìm token trong database
    const verification = await EmailVerification.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    // Cập nhật trạng thái xác thực của user
    const user = await User.findById(verification.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }

    user.isVerified = true;
    await user.save();

    // Đánh dấu token đã sử dụng
    verification.used = true;
    await verification.save();

    res.json({
      success: true,
      message: 'Email đã được xác thực thành công',
    });
  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  sendVerification,
  verifyEmail,
}; 