const User = require('../models/User');
const Role = require('../models/Role');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');

const crypto = require('crypto');
// Tạo JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Đăng ký tài khoản
// exports.register = async (req, res) => {
//   try {
//     const { email, password, repassword, fullName, role: requestedRole } = req.body;

//     // Validate dữ liệu đầu vào
//     if (!email || !password || !repassword || !fullName) {
//       return res.status(400).json({
//         success: false,
//         message: 'Vui lòng điền đầy đủ thông tin',
//       });
//     }

//     // Kiểm tra password và repassword
//     if (password !== repassword) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mật khẩu xác nhận không khớp',
//       });
//     }

//     // Kiểm tra độ dài password
//     if (password.length < 6) {
//       return res.status(400).json({
//         success: false,
//         message: 'Mật khẩu phải có ít nhất 6 ký tự',
//       });
//     }

//     // Kiểm tra email đã tồn tại
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'Email đã được sử dụng',
//       });
//     }

//     // Xác định role cho user mới
//     let role;
//     if (requestedRole) {
//       // Nếu có yêu cầu role cụ thể, kiểm tra xem có phải admin không
//       role = await Role.findOne({ name: requestedRole });
//       if (!role) {
//         return res.status(400).json({
//           success: false,
//           message: 'Vai trò không hợp lệ',
//         });
//       }
//       // Chỉ cho phép tạo tài khoản admin đầu tiên
//       if (requestedRole === 'admin') {
//         const adminCount = await User.countDocuments({ role: role._id });
//         if (adminCount > 0) {
//           return res.status(403).json({
//             success: false,
//             message: 'Không thể tạo thêm tài khoản admin',
//           });
//         }
//       }
//     } else {
//       // Mặc định là role student
//       role = await Role.findOne({ name: 'student' });
//       if (!role) {
//         return res.status(500).json({
//           success: false,
//           message: 'Không tìm thấy role student',
//         });
//       }
//     }

//     // Tạo user mới
//     const user = new User({
//       email,
//       password,
//       fullName,
//       role: role._id,
//     });

//     // Tạo mã xác thực email
//     await user.createEmailVerificationToken();

//     // Lưu user
//     await user.save();

//     // Gửi email xác thực
//     try {
//       await sendVerificationEmail(user.email, user.email_verification_token);
//     } catch (emailError) {
//       console.error('Lỗi gửi email xác thực:', emailError);
//       // Không trả về lỗi nếu gửi email thất bại
//     }

//     // Trả về thông tin user (không bao gồm token)
//     res.status(201).json({
//       success: true,
//       message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
//       data: {
//         user: {
//           _id: user._id,
//           email: user.email,
//           fullName: user.fullName,
//           role: role.name,
//           isVerified: user.email_verified,
//           createdAt: user.created_at,
//         },
//       },
//     });
//   } catch (error) {
//     console.error('Lỗi đăng ký:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server',
//       error: error.message,
//     });
//   }
// };

exports.register = async (req, res) => {
  try {
    const { email, password, repassword, fullName, role: requestedRole } = req.body;

    // Validate input
    if (!email || !password || !repassword || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin',
      });
    }

    // Check password match
    if (password !== repassword) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu xác nhận không khớp',
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng',
      });
    }

    // Determine user role
    let role;
    if (requestedRole) {
      role = await Role.findOne({ name: requestedRole });
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Vai trò không hợp lệ',
        });
      }
      // Restrict admin role creation
      if (requestedRole === 'admin') {
        const adminCount = await User.countDocuments({ role: role._id });
        if (adminCount > 0) {
          return res.status(403).json({
            success: false,
            message: 'Không thể tạo thêm tài khoản admin',
          });
        }
      }
    } else {
      role = await Role.findOne({ name: 'student' });
      if (!role) {
        return res.status(500).json({
          success: false,
          message: 'Không tìm thấy role student',
        });
      }
    }

    // Create new user
    const user = new User({
      email,
      password,
      fullName,
      role: role._id,
    });

    // Generate email verification token
    const verificationToken = await user.createEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Lỗi gửi email xác thực:', emailError);
      // Log error but don't fail registration
    }

    // Respond with user data
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: role.name,
          isVerified: user.email_verified,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      email_verification_token: crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
      email_verification_expires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    // Update verification status
    user.email_verified = true;
    user.email_verification_token = undefined;
    user.email_verification_expires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Xác thực email thành công',
    });
  } catch (error) {
    console.error('Lỗi xác thực email:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực email',
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email và mật khẩu',
      });
    }

    // Tìm user và kiểm tra password
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    // Cập nhật last_login
    user.last_login = Date.now();
    await user.save();

    // Tạo JWT token
    const token = createToken(user._id);

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.email_verified,
          avatar: user.avatar,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi đăng nhập',
      error: error.message,
    });
  }
};

// Xác thực email
// exports.verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.params;

//     // Tìm user với token hợp lệ
//     const user = await User.findOne({
//       email_verification_token: crypto
//         .createHash('sha256')
//         .update(token)
//         .digest('hex'),
//       email_verification_expires: { $gt: Date.now() },
//     });

//     if (!user) {
//       return res.status(400).json({
//         success: false,
//         message: 'Token không hợp lệ hoặc đã hết hạn',
//       });
//     }

//     // Cập nhật trạng thái xác thực
//     user.email_verified = true;
//     user.email_verification_token = undefined;
//     user.email_verification_expires = undefined;
//     await user.save();

//     res.json({
//       success: true,
//       message: 'Xác thực email thành công',
//     });
//   } catch (error) {
//     console.error('Lỗi xác thực email:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi xác thực email',
//       error: error.message,
//     });
//   }
// };

// Gửi lại email xác thực
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này',
      });
    }

    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được xác thực',
      });
    }

    // Tạo token mới và gửi email
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    try {
      await sendVerificationEmail(user.email, verificationToken);
      res.json({
        success: true,
        message: 'Đã gửi lại email xác thực',
      });
    } catch (error) {
      console.error('Lỗi gửi email xác thực:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi gửi email xác thực',
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Lỗi gửi lại email xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi gửi lại email xác thực',
      error: error.message,
    });
  }
};

// Quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản với email này',
      });
    }

    // Tạo token reset mật khẩu
    const resetToken = user.createPasswordResetToken();
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, resetToken);
      res.json({
        success: true,
        message: 'Đã gửi email hướng dẫn đặt lại mật khẩu',
      });
    } catch (error) {
      user.reset_password_token = undefined;
      user.reset_password_expires = undefined;
      await user.save();

      console.error('Lỗi gửi email reset mật khẩu:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi gửi email reset mật khẩu',
        error: error.message,
      });
    }
  } catch (error) {
    console.error('Lỗi quên mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi quên mật khẩu',
      error: error.message,
    });
  }
};

// Reset mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Tìm user với token hợp lệ
    const user = await User.findOne({
      reset_password_token: crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
      reset_password_expires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
      });
    }

    // Cập nhật mật khẩu
    user.password = password;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
    });
  } catch (error) {
    console.error('Lỗi reset mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi đặt lại mật khẩu',
      error: error.message,
    });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản',
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi lấy thông tin tài khoản',
      error: error.message,
    });
  }
};

// Cập nhật thông tin user
exports.updateMe = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'avatar'];

    // Lọc các trường được phép cập nhật
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).populate('role');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản',
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Lỗi cập nhật thông tin:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi cập nhật thông tin',
      error: error.message,
    });
  }
};

// Đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài khoản',
      });
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng',
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi đổi mật khẩu',
      error: error.message,
    });
  }
};