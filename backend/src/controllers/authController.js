const User = require('../models/User');
const { Role } = require('../models/Role'); 
const jwt = require('jsonwebtoken');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../config/email');
const crypto = require('crypto');
const InstructorProfile = require('../models/instructor/InstructorProfile');
const { log } = require('console');
const ApiError = require('../utils/ApiError');
const { validateSchema } = require('../utils/validateSchema');
const { loginSchema, registerSchema } = require('../validations/auth.validation');

// Tạo JWT token
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Đăng ký tài khoản
exports.register = async (req, res, next) => {
  try {
    // Validate dữ liệu
    await validateSchema(registerSchema, req.body);

    const { email, password, repassword, fullName, role: requestedRole } = req.body;

    // Validate dữ liệu đầu vào
    if (!email || !password || !repassword || !fullName) {
      throw new ApiError(400, 'Vui lòng điền đầy đủ thông tin');
    }

    // Kiểm tra password và repassword
    if (password !== repassword) {
      throw new ApiError(400, 'Mật khẩu xác nhận không khớp');
    }

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

    // Tạo user mới
    const user = new User({
      email,
      password,
      name: fullName,
      role_id: role._id,
      approval_status: requestedRole === 'instructor' ? 'pending' : 'approved',
      status: 'inactive', // Mặc định là inactive khi chưa xác thực email
    });

    // Tạo mã xác thực email
    const verificationToken = user.createEmailVerificationToken();
    await user.save();

    // Gửi email xác thực
    try {
      await sendVerificationEmail(user.email, verificationToken);
    } catch (emailError) {
      console.error('Lỗi gửi email xác thực:', emailError);
      // Không trả về lỗi nếu gửi email thất bại
    }

    // Tạo token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Populate role để lấy thông tin vai trò
    await user.populate('role_id');

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.name,
          role: role.name,
          isVerified: user.email_verified,
          approval_status: user.approval_status,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Đăng ký tài khoản giảng viên
// exports.registerInstructor = async (req, res) => {
//   const { bio, expertise, education, experience } = req.body;
//   console.log("acb", req.body.experience)
//   try {
//   // const { bio, expertise, education, experience } = req.body;

//     const user = req.user;
//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: 'Vui lòng đăng nhập để đăng ký làm giảng viên',
//       });
//     }
//     const instructorRole = await Role.findOne({ name: 'instructor' });
//     if (!instructorRole) {
//       return res.status(500).json({
//         success: false,
//         message: 'Không tìm thấy role instructor',
//       });
//     }

//     if (user.role_id.toString() === instructorRole._id.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Bạn đã là giảng viên',
//       });
//     }

//     // Parse nếu là chuỗi JSON
//     let parsedEducation = education;
//     let parsedExperience = experience;

//     if (typeof education === 'string') {
//       try {
//         parsedEducation = JSON.parse(education);
//       } catch {
//         return res.status(400).json({ success: false, message: 'education không hợp lệ' });
//       }
//     }
    
// if (typeof experience === 'string') {
//   // nếu nhận chuỗi rỗng, chuyển thành mảng rỗng hoặc parse JSON
//   if (experience === '') {
//     req.body.experience = [];
//   } else {
//     try {
//       req.body.experience = JSON.parse(experience);
//     } catch (e) {
//       // handle lỗi parse
//         return res.status(400).json({ success: false, message: 'experience không hợp lệ' });

//     }
//   }
// }
//     // if (typeof experience === 'string') {
//     //   try {
//     //     parsedExperience = JSON.parse(experience);
//     //   } catch {
//     //     return res.status(400).json({ success: false, message: 'experience không hợp lệ' });
//     //   }
//     // }

//     // Ensure both are arrays
//     if (!Array.isArray(parsedEducation)) parsedEducation = [];
//     if (!Array.isArray(parsedExperience)) parsedExperience = [];

//     // Filter out rác (ví dụ: phần tử là string hoặc object rỗng)
//     parsedExperience = parsedExperience
//   .filter(
//     item =>
//       item &&
//       typeof item === 'object' &&
//       item.position &&
//       item.company &&
//       item.startDate &&
//       item.endDate
//   )
//   .map(item => ({
//     ...item,
//     startDate: new Date(item.startDate),
//     endDate: new Date(item.endDate),
//   }));

//     parsedEducation = parsedEducation
//   .filter(
//     item =>
//       item &&
//       typeof item === 'object' &&
//       item.degree &&
//       item.institution &&
//       item.year
//   )
//   .map(item => ({
//     ...item,
//     year: parseInt(item.year, 10),
//   }));


//     // Cập nhật user
//     user.role_id = instructorRole._id;
//     user.approval_status = 'pending';
//     user.status = 'inactive';
//     await user.save();

    
//     const instructorProfile = new InstructorProfile({
//       userId: user._id,
//       bio: bio || '',
//       expertise: expertise || '',
//       education: parsedEducation,
//       experience: parsedExperience,
//       status: 'pending',
//     });

//     await instructorProfile.save();

//     res.status(201).json({
//       success: true,
//       message: 'Đăng ký làm giảng viên thành công.',
//       data: {
//         user: {
//           _id: user._id,
//           email: user.email,
//           fullName: user.name,
//           role: instructorRole.name,
//           approval_status: user.approval_status,
//           status: user.status,
//         },
//         instructorProfile,
//       },
//     });
//   } catch (error) {
//     console.error('Lỗi đăng ký giảng viên:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Lỗi server',
//       error: error.message,
//     });
//   }
// };

exports.registerInstructor = async (req, res) => {
  try {
    const { bio, expertise, gender, education, experience } = req.body;

    const user = await User.findById(req.user._id);
    console.log('User loaded from DB:', user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để đăng ký làm giảng viên',
      });
    }

    // Kiểm tra đã là giảng viên chưa
    if (user.isInstructor) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã là giảng viên',
      });
    }

    // Kiểm tra đã gửi đăng ký rồi chưa
    if (user.has_registered_instructor) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký làm giảng viên rồi. Vui lòng chờ duyệt.',
      });
    }
    user.has_registered_instructor = true;

    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      return res.status(500).json({
        success: false,
        message: 'Không tìm thấy role instructor',
      });
    }

    // Hàm helper parse JSON hoặc trả về mảng rỗng
    const parseJsonArray = (input) => {
      if (!input) return [];
      if (typeof input === 'string') {
        if (input.trim() === '') return [];
        try {
          const parsed = JSON.parse(input);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return null; // lỗi parse
        }
      }
      return Array.isArray(input) ? input : [];
    };

    const parsedEducation = parseJsonArray(education);
    if (parsedEducation === null) {
      return res.status(400).json({ success: false, message: 'education không hợp lệ' });
    }

    const parsedExperience = parseJsonArray(experience);
    if (parsedExperience === null) {
      return res.status(400).json({ success: false, message: 'experience không hợp lệ' });
    }

    const filteredExperience = parsedExperience.filter(
      item =>
        item &&
        typeof item === 'object' &&
        item.position &&
        item.company &&
        item.startDate
    ).map(item => ({
      ...item,
      startDate: new Date(item.startDate),
      endDate: item.endDate ? new Date(item.endDate) : undefined,
    }));

    const filteredEducation = parsedEducation.filter(
      item =>
        item &&
        typeof item === 'object' &&
        item.degree &&
        item.institution &&
        item.year
    );

    // Cập nhật thông tin giảng viên (chưa duyệt)
    user.role_id = instructorRole._id;
    user.approval_status = 'pending';
    // user.status = 'inactive';
    user.has_registered_instructor = true; // Đánh dấu đã gửi đăng ký
    user.instructorInfo = {
      bio: bio || '',
      gender: req.body.gender || user.instructorInfo?.gender,
      phone: user.instructorInfo?.phone || '',
      education: filteredEducation.length > 0 ? filteredEducation : [],
      experience: filteredExperience.length > 0 ? filteredExperience : [],
      is_approved: false,
    };
console.log('has_registered_instructor before save:', user.has_registered_instructor);

    await user.save();

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản giảng viên thành công. Vui lòng chờ xác minh tài khoản!',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          fullName: user.name,
          role: instructorRole.name,
          approval_status: user.approval_status,
          status: user.status,
          instructorInfo: user.instructorInfo,
        },
      },
    });

  } catch (error) {
    console.error('Lỗi đăng ký giảng viên:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

// Đăng nhập
exports.login = async (req, res, next) => {
  try {
    // Validate dữ liệu
    await validateSchema(loginSchema, req.body);

    const { email, password } = req.body;

    // Tìm user theo email
    const user = await User.findOne({ email }).select('+password').populate('role_id');
    if (!user) {
      throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
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
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản đã bị khóa',
      });
    }

    // Kiểm tra trạng thái phê duyệt
    if (user.approval_status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản chưa được xác minh',
      });
    }

    if (user.approval_status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản xác minh thất bại, vui lòng tạo tài khoản mới',
      });
    }

    // Chỉ cho phép đăng nhập khi approval_status là 'approved'
    if (user.approval_status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản không có quyền đăng nhập',
      });
    }

    // Tạo token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          _id: user._id,
          email: user.email,
          full_name: user.name,
          role: user.role_id,
          avatar: user.avatar,
          isVerified: user.email_verified,
          approval_status: user.approval_status,
          createdAt: user.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Xác thực email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      email_verification_token: crypto
        .createHash('sha256')
        .update(token)
        .digest('hex'),
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    }

    // Cập nhật trạng thái xác thực và status
    user.email_verified = true;
    user.email_verification_token = undefined;
    user.status = 'active'; // Chuyển sang active khi xác thực thành công
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
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('role_id');
    if (!user) {
      throw new ApiError(404, 'Không tìm thấy tài khoản');
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        email: user.email,
        full_name: user.name,
        role: user.role_id,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cập nhật thông tin user
exports.updateMe = async (req, res) => {
  try {
    const allowedUpdates = ['name', 'nickname', 'avatar', 'bio', 'social_links'];

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
    ).populate('role_id');

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