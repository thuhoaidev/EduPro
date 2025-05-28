const nodemailer = require('nodemailer');

// Tạo transporter với cấu hình SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Hàm gửi email
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"EduPro" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email đã được gửi:', info.messageId);
    return info;
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    throw error;
  }
};

// Hàm gửi email xác thực
exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const subject = 'Xác thực email - EduPro';
  const html = `
    <h1>Xác thực email của bạn</h1>
    <p>Xin chào,</p>
    <p>Cảm ơn bạn đã đăng ký tài khoản tại EduPro. Vui lòng click vào link bên dưới để xác thực email của bạn:</p>
    <p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Xác thực email</a>
    </p>
    <p>Hoặc copy link sau vào trình duyệt:</p>
    <p>${verificationUrl}</p>
    <p>Link này sẽ hết hạn sau 24 giờ.</p>
    <p>Nếu bạn không yêu cầu xác thực email này, vui lòng bỏ qua email này.</p>
    <p>Trân trọng,<br>Đội ngũ EduPro</p>
  `;

  return sendEmail(email, subject, html);
};

// Hàm gửi email reset mật khẩu
exports.sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const subject = 'Đặt lại mật khẩu - EduPro';
  const html = `
    <h1>Đặt lại mật khẩu</h1>
    <p>Xin chào,</p>
    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng click vào link bên dưới để đặt lại mật khẩu:</p>
    <p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        margin: 16px 0;
      ">Đặt lại mật khẩu</a>
    </p>
    <p>Hoặc copy link sau vào trình duyệt:</p>
    <p>${resetUrl}</p>
    <p>Link này sẽ hết hạn sau 1 giờ.</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
    <p>Trân trọng,<br>Đội ngũ EduPro</p>
  `;

  return sendEmail(email, subject, html);
}; 