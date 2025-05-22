const nodemailer = require('nodemailer');

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Gửi email xác thực
const sendVerificationEmail = async (email, name, verificationUrl) => {
  const mailOptions = {
    from: `"EduPro" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Xác thực email của bạn - EduPro',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${name},</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản tại EduPro. Để hoàn tất quá trình đăng ký, vui lòng xác thực email của bạn bằng cách nhấp vào nút bên dưới:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Xác thực Email
          </a>
        </div>
        <p>Hoặc bạn có thể copy đường link sau vào trình duyệt:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Link xác thực này sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không thực hiện đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Email này được gửi tự động, vui lòng không trả lời.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Lỗi gửi email:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
}; 