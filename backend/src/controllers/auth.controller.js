const User = require('../models/User');
const { Role } = require('../models/Role'); 
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { loginSchema, registerSchema } = require('../validations/auth.validation');
const slugify = require('slugify');

// Tạo JWT token
const createToken = (userId) => {
  console.log('Creating token for user:', userId);
  
  // Đảm bảo userId là string
  const id = userId.toString();
  console.log('Token ID:', id);
  
  try {
    // Sử dụng Buffer và string literal cho secret
    const token = jwt.sign({ id }, Buffer.from('your-secret-key'), {
      expiresIn: '24h'
    });
    console.log('Token created:', token);
    return token;
  } catch (error) {
    console.error('Error creating token:', error);
    throw error;
  }
};

// Đăng ký tài khoản
exports.register = async (req, res, next) => {
  try {
    console.log('Received body:', JSON.stringify(req.body, null, 2));
    // Validate dữ liệu
    await validateSchema(registerSchema, req.body);

    const { nickname, email, password, role: requestedRole } = req.body;
    const fullname = req.body.fullName || req.body.fullname;
    console.log('Received fullname:', fullname);

    // Debug: Kiểm tra các giá trị sau khi destructuring
    console.log('After destructuring:', { nickname, email, password, requestedRole, fullname });

    // Kiểm tra độ dài password
    if (password.length < 6) {
      throw new ApiError(400, 'Mật khẩu phải có ít nhất 6 ký tự');
    }

    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, 'Email đã được sử dụng');
    }

    // Xác định role cho user mới
    let role;
    if (requestedRole) {
      role = await Role.findOne({ name: requestedRole });
      if (!role) {
        throw new ApiError(400, 'Vai trò không hợp lệ');
      }
      // Chỉ cho phép tạo tài khoản admin đầu tiên
      if (requestedRole === 'admin') {
        const adminCount = await User.countDocuments({ role_id: role._id });
        if (adminCount > 0) {
          throw new ApiError(403, 'Không thể tạo thêm tài khoản admin');
        }
      }
    } else {
      role = await Role.findOne({ name: 'student' });
      if (!role) {
        throw new ApiError(500, 'Không tìm thấy role student');
      }
    }

    // Xử lý nickname để tạo slug
    const normalizedNickname = nickname.toLowerCase().replace(/[^a-z0-9]/g, '-');
    
    // Kiểm tra xem slug đã tồn tại chưa
    let slug = normalizedNickname;
    let counter = 1;
    let userWithSlug;
    
    do {
      userWithSlug = await User.findOne({ slug });
      if (userWithSlug) {
        slug = `${normalizedNickname}-${counter++}`;
      }
    } while (userWithSlug);
    
    // Xử lý fullname
    const normalizedFullname = fullname ? 
      fullname.normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[đĐ]/g, 'd') 
      : '';

    // Tạo token xác thực email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    console.log('Generated verification token:', verificationToken);
    console.log('Hashed token:', hashedToken);

    // Tạo user mới
    const user = new User({
      email,
      password,
      nickname,
      slug: normalizedNickname,
      role_id: role._id,
      fullname: normalizedFullname,
      status: 'inactive',
      email_verification_token: hashedToken,
      email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      approval_status: role.name === 'student' ? 'approved' : null
    });

    // Ghi log thông tin user trước khi lưu
    console.log('User to save:', {
      email: user.email,
      nickname: user.nickname,
      slug: user.slug,
      role_id: user.role_id,
      status: user.status,
      email_verification_token: user.email_verification_token,
      email_verification_expires: user.email_verification_expires
    });

    // Debug: Kiểm tra dữ liệu user trước khi save
    console.log('User data before save:', user);

    // Debug: Kiểm tra giá trị của fullname
    console.log('Fullname:', fullname);

    // Lưu user vào database
    try {
      const savedUser = await user.save();
      console.log('User saved successfully:', savedUser);

      // Gửi email xác thực
      try {
        await sendVerificationEmail(user.email, user.fullname, verificationToken);
      } catch (emailError) {
        console.error('Lỗi gửi email xác thực:', emailError);
        // Không trả về lỗi nếu gửi email thất bại
      }

      // Tạo token để trả về ngay sau khi đăng ký thành công
      const token = createToken(savedUser._id.toString());
      console.log('Token created after registration:', token);

      // Tạo response user object
      const userResponse = {
        _id: savedUser._id,
        email: savedUser.email,
        fullname: savedUser.fullname,
        role: role.name,
        isVerified: savedUser.email_verified,
        approval_status: savedUser.approval_status,
        createdAt: savedUser.created_at
      };

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        data: {
          token,
          user: userResponse
        },
        debug: {
          user: {
            ...userResponse,
            role_id: role._id,
            role_name: role.name
          }
        }
      });

    } catch (saveError) {
      console.error('Lỗi lưu user:', saveError);
      throw saveError;
    }
  } catch (error) {
    next(error);
  }
};


// Đăng nhập
exports.verifyEmail = async (req, res, next) => {
  try {
    console.log('Params received:', req.params);
    const { slug, token } = req.params;

    // Kiểm tra slug và token
    if (!slug || !token) {
      throw new ApiError(400, 'Thiếu thông tin xác thực');
    }

    // Tìm user bằng slug
    const user = await User.findOne({ slug });
    if (!user) {
      throw new ApiError(404, 'Người dùng không tồn tại');
    }

    // Hash token nhận được để so sánh
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log('Checking verification:', {
      hashedToken,
      storedToken: user.email_verification_token,
      expires: user.email_verification_expires,
      currentTime: new Date()
    });

    // Kiểm tra token và thời hạn
    if (!user.email_verification_token || 
        !user.email_verification_expires || 
        user.email_verification_token !== hashedToken || 
        user.email_verification_expires < Date.now()) {
      throw new ApiError(401, 'Link xác thực không hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật trạng thái email đã xác thực
    user.email_verified = true;
    user.status = 'active';
    user.email_verification_token = undefined;
    user.email_verification_expires = undefined;

    await user.save();

    // Tạo token đăng nhập mới
    const loginToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Lấy thông tin role
    await user.populate('role_id');

    // Trả về thông tin user và token
    res.status(200).json({
      success: true,
      message: 'Xác thực email thành công',
      data: {
        token: loginToken,
        user: {
          _id: user._id,
          email: user.email,
          fullname: user.fullname,
          nickname: user.nickname,
          role: user.role_id.name,
          avatar: user.avatar,
          status: user.status,
          approval_status: user.approval_status,
          isVerified: user.email_verified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Validate dữ liệu
    await validateSchema(loginSchema, req.body);

    const { identifier, password } = req.body;

    // Tìm user theo identifier (có thể là email hoặc nickname)
    const user = await User.findOne({
      $or: [
        { email: req.body.identifier },
        { nickname: req.body.identifier }
      ]
    }).select('+password').populate('role_id');

    // Nếu không tìm thấy user hoặc mật khẩu không đúng, trả về thông báo chung
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng',
      });
    }

    // Kiểm tra xác thực email
    if (!user.email_verified) {
      return res.status(403).json({
        success: false,
        message: 'Vui lòng xác thực email trước khi đăng nhập',
        data: {
          email: user.email,
          canResendVerification: true,
        },
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    // Kiểm tra trạng thái phê duyệt cho giảng viên
    if (user.role_id && user.role_id.name === 'instructor') {
      switch (user.approval_status) {
        case null:
        case 'pending':
          return res.status(403).json({
            success: false,
            message: 'Tài khoản giảng viên đang chờ xét duyệt',
          });
        case 'rejected':
          return res.status(403).json({
            success: false,
            message: 'Tài khoản giảng viên đã bị từ chối. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.',
          });
      }
    }

    // Cập nhật thời gian đăng nhập cuối cùng
    user.last_login = new Date();
    await user.save();

    // Tạo token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Trả về thông tin user và token
    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullname: user.fullname,
          nickname: user.nickname,
          role: user.role_id.name,
          avatar: user.avatar,
          status: user.status,
          approval_status: user.approval_status,
          isVerified: user.email_verified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Gửi lại email xác thực
exports.resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'Email không tồn tại trong hệ thống');
    }

    // Kiểm tra nếu email đã được xác thực
    if (user.email_verified) {
      throw new ApiError(400, 'Email này đã được xác thực');
    }

    // Tạo token mới
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Cập nhật token và thời hạn mới
    user.email_verification_token = hashedToken;
    user.email_verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();

    // Gửi email xác thực
    try {
      await sendVerificationEmail(user.email, user.fullname, verificationToken);
      res.status(200).json({
        success: true,
        message: 'Email xác thực đã được gửi lại thành công'
      });
    } catch (error) {
      // Nếu gửi email thất bại, xóa token đã tạo
      user.email_verification_token = undefined;
      user.email_verification_expires = undefined;
      await user.save();
      throw new ApiError(500, 'Không thể gửi email xác thực. Vui lòng thử lại sau.');
    }
  } catch (error) {
    next(error);
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
      // Gửi email với link reset password
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      await sendPasswordResetEmail(user.email, resetUrl);
      res.json({
        success: true,
        message: 'Đã gửi email hướng dẫn đặt lại mật khẩu',
      });
    } catch (error) {
      // Nếu gửi email thất bại, vẫn giữ token để người dùng có thể thử lại sau
      console.error('Lỗi gửi email reset mật khẩu:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi gửi email reset mật khẩu',
        error: error.message
      });

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
    const { resetToken } = req.params;
    const { password } = req.body;

    // Tìm user với token hợp lệ
    const user = await User.findOne({
      reset_password_token: crypto
        .createHash('sha256')
        .update(resetToken)
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

    // Tạo token mới cho user sau khi reset mật khẩu
    const userToken = createToken(user._id);

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
      token: userToken,
      user: {
        id: user._id,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        status: user.status,
        email_verified: user.email_verified,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
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
    const isMatch = await user.matchPassword(currentPassword);
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