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

// Gửi email xác minh cho instructor registration
const sendInstructorVerificationEmail = async (email, fullName, verificationToken) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-instructor-email/${verificationToken}`;
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EduPro Platform'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Xác minh email - Đăng ký giảng viên EduPro',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Xác minh email - Đăng ký giảng viên</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f3e8ff 100%);
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .header {
              background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              position: relative;
              z-index: 1;
            }
            .header .subtitle {
              margin: 8px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 20px;
              margin-bottom: 24px;
              color: #1e293b;
              font-weight: 600;
            }
            .message {
              font-size: 16px;
              margin-bottom: 32px;
              color: #475569;
              line-height: 1.8;
            }
            .verification-button {
              display: inline-block;
              background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              margin: 24px 0;
              transition: all 0.3s ease;
              box-shadow: 0 10px 25px -5px rgba(6, 182, 212, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.2);
            }
            .verification-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 20px 25px -5px rgba(6, 182, 212, 0.4), 0 10px 10px -5px rgba(139, 92, 246, 0.3);
            }
            .warning {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              color: #92400e;
              position: relative;
            }
            .warning::before {
              content: '⚠️';
              position: absolute;
              top: 20px;
              left: 20px;
              font-size: 20px;
            }
            .warning-content {
              margin-left: 35px;
            }
            .footer {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 30px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }
            .link {
              color: #06b6d4;
              text-decoration: none;
              font-weight: 500;
            }
            .link:hover {
              text-decoration: underline;
            }
            .steps {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 1px solid #0ea5e9;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            }
            .steps h4 {
              color: #0369a1;
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
            }
            .steps ol {
              margin: 0;
              padding-left: 20px;
              color: #0c4a6e;
            }
            .steps li {
              margin-bottom: 8px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: white;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 EduPro</div>
              <h1>Xác minh email</h1>
              <div class="subtitle">Hoàn tất đăng ký giảng viên</div>
            </div>
            <div class="content">
              <div class="greeting">Xin chào ${fullName}!</div>
              <div class="message">
                Cảm ơn bạn đã đăng ký trở thành giảng viên tại EduPro! Để hoàn tất quá trình đăng ký, 
                vui lòng xác minh địa chỉ email của bạn bằng cách nhấn vào nút bên dưới.
              </div>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="verification-button">
                  ✅ Xác minh email ngay
                </a>
              </div>
              
              <div class="warning">
                <div class="warning-content">
                  <strong>Lưu ý quan trọng:</strong> Link xác minh này sẽ hết hạn sau 24 giờ. 
                  Nếu bạn không thể nhấn vào nút trên, hãy copy và paste link sau vào trình duyệt:
                  <br><br>
                  <a href="${verificationUrl}" class="link">${verificationUrl}</a>
                </div>
              </div>
              
              <div class="steps">
                <h4>📋 Quy trình tiếp theo:</h4>
                <ol>
                  <li>Xác minh email (bước hiện tại)</li>
                  <li>Xét duyệt hồ sơ (3-5 ngày)</li>
                  <li>Nhận thông báo kết quả qua email</li>
                  <li>Bắt đầu tạo khóa học (nếu được chấp thuận)</li>
                </ol>
              </div>
              
              <div class="message">
                Sau khi xác minh email thành công, hồ sơ của bạn sẽ được gửi cho admin xét duyệt. 
                Chúng tôi sẽ thông báo kết quả qua email trong thời gian sớm nhất.
              </div>
            </div>
            <div class="footer">
              <p>Nếu bạn không thực hiện đăng ký này, vui lòng bỏ qua email này.</p>
              <p>© 2024 EduPro Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Instructor verification email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending instructor verification email:', error);
    throw error;
  }
};

// Gửi email thông báo hồ sơ đã được gửi cho admin
const sendInstructorProfileSubmittedEmail = async (email, fullName) => {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EduPro Platform'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Hồ sơ giảng viên đã được gửi - EduPro',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hồ sơ đã được gửi - EduPro</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 50%, #f3e8ff 100%);
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              position: relative;
              z-index: 1;
            }
            .header .subtitle {
              margin: 8px 0 0 0;
              font-size: 16px;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 20px;
              margin-bottom: 24px;
              color: #1e293b;
              font-weight: 600;
            }
            .message {
              font-size: 16px;
              margin-bottom: 32px;
              color: #475569;
              line-height: 1.8;
            }
            .success-box {
              background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
              border: 1px solid #22c55e;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              color: #166534;
              position: relative;
            }
            .success-box::before {
              content: '🎉';
              position: absolute;
              top: 24px;
              left: 24px;
              font-size: 24px;
            }
            .success-content {
              margin-left: 40px;
            }
            .info-box {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border: 1px solid #94a3b8;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              color: #334155;
            }
            .footer {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 30px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }
            .link {
              color: #06b6d4;
              text-decoration: none;
              font-weight: 500;
            }
            .link:hover {
              text-decoration: underline;
            }
            .timeline {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 1px solid #0ea5e9;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            }
            .timeline h4 {
              color: #0369a1;
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
            }
            .timeline ul {
              margin: 0;
              padding-left: 20px;
              color: #0c4a6e;
            }
            .timeline li {
              margin-bottom: 8px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: white;
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">🎓 EduPro</div>
              <h1>Hồ sơ đã được gửi!</h1>
              <div class="subtitle">Xác minh email thành công</div>
            </div>
            <div class="content">
              <div class="greeting">Xin chào ${fullName}!</div>
              
              <div class="success-box">
                <div class="success-content">
                  <strong>Chúc mừng!</strong> Email của bạn đã được xác minh thành công và hồ sơ giảng viên 
                  đã được gửi cho admin xét duyệt.
                </div>
              </div>
              
              <div class="timeline">
                <h4>📅 Những gì sẽ xảy ra tiếp theo:</h4>
                <ul>
                  <li>Admin sẽ xem xét hồ sơ của bạn trong vòng 3-5 ngày làm việc</li>
                  <li>Bạn sẽ nhận được email thông báo kết quả xét duyệt</li>
                  <li>Nếu được chấp thuận, bạn có thể bắt đầu tạo khóa học ngay</li>
                  <li>Trong thời gian chờ, bạn có thể chuẩn bị nội dung khóa học</li>
                </ul>
              </div>
              
              <div class="info-box">
                <strong>📧 Liên hệ hỗ trợ:</strong><br>
                Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi qua email: 
                <a href="mailto:support@edupro.com" class="link">support@edupro.com</a>
              </div>
              
              <div class="message">
                Cảm ơn bạn đã quan tâm đến việc trở thành giảng viên tại EduPro! 
                Chúng tôi rất mong được hợp tác cùng bạn để tạo ra những khóa học chất lượng cao.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 EduPro Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Profile submitted email sent successfully to:', email);
  } catch (error) {
    console.error('Error sending profile submitted email:', error);
    throw error;
  }
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

module.exports = {
  sendEmail,
  sendInstructorVerificationEmail,
  sendInstructorProfileSubmittedEmail,
};
