const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"EduPro" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

exports.sendApprovalEmail = async (email, name) => {
  const subject = 'Tài khoản giảng viên của bạn đã được duyệt - EduPro';
  const html = `
    <h2>Xin chào ${name},</h2>
    <p>Tài khoản giảng viên của bạn trên EduPro đã được duyệt thành công.</p>
    <p>Bạn có thể đăng nhập tại: <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
    <p>Chúc bạn một ngày tốt lành!</p>
    <p>Đội ngũ EduPro</p>
  `;
  return sendEmail(email, subject, html);
};

exports.sendRejectionEmail = async (email, name) => {
  const subject = 'Tài khoản giảng viên bị từ chối - EduPro';
  const html = `
    <h2>Xin chào ${name},</h2>
    <p>Chúng tôi rất tiếc, tài khoản giảng viên của bạn trên EduPro chưa được duyệt.</p>
    <p>Vui lòng kiểm tra lại thông tin hồ sơ hoặc liên hệ hỗ trợ để biết thêm chi tiết.</p>
    <p>Trân trọng,<br>Đội ngũ EduPro</p>
  `;
  return sendEmail(email, subject, html);
};
