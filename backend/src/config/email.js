const nodemailer = require('nodemailer');

// Create transporter with SMTP configuration
const transporter = nodemailer.createTransport({
  // host: process.env.SMTP_HOST || 'smtp.example.com',
  // port: process.env.SMTP_PORT || 587,
  // secure: process.env.SMTP_PORT === '465',
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: `"EduPro" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

exports.sendVerificationEmail = async (email, fullname, token) => {
  console.log('Sending verification email with token:', token);
  console.log('Frontend URL:', process.env.FRONTEND_URL);
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${encodeURIComponent(token)}`;
  
  const subject = 'Xác thực email - EduPro';
  const html = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Xác thực email - EduPro</title>
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
          background: url('data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'25\' cy=\'25\' r=\'1\' fill=\'white\' opacity=\'0.1\'/><circle cx=\'75\' cy=\'75\' r=\'1\' fill=\'white\' opacity=\'0.1\'/><circle cx=\'50\' cy=\'10\' r=\'0.5\' fill=\'white\' opacity=\'0.1\'/><circle cx=\'10\' cy=\'60\' r=\'0.5\' fill=\'white\' opacity=\'0.1\'/><circle cx=\'90\' cy=\'40\' r=\'0.5\' fill=\'white\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>');
          opacity: 0.3;
        }
        .logo {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎓 EduPro</div>
          <h1>Xác thực email</h1>
          <div class="subtitle">Hoàn tất đăng ký tài khoản</div>
        </div>
        <div class="content">
          <div class="greeting">Xin chào, ${fullname || 'bạn'}!</div>
          <div class="message">
            Cảm ơn bạn đã đăng ký tài khoản tại <b>EduPro</b>.<br />
            Vui lòng nhấn vào nút bên dưới để xác thực email và hoàn tất đăng ký:
          </div>
          <a href="${verificationUrl}" class="verification-button">Xác thực email</a>
          <div class="warning">
            <div class="warning-content">
              Nếu bạn không đăng ký tài khoản EduPro, vui lòng bỏ qua email này.
            </div>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EduPro. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;
  await sendEmail(email, subject, html);
};

exports.sendPasswordResetEmail = async (email, resetUrl) => {
  const subject = 'Đặt lại mật khẩu - EduPro';
  const html = `
    <h1>Đặt lại mật khẩu</h1>
    <p>Xin chào,</p>
    <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản của mình. Vui lòng click vào nút bên dưới để đặt lại mật khẩu:</p>
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
    <p>Hoặc copy và dán link sau vào trình duyệt:</p>
    <p>${resetUrl}</p>
    <p>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
    <p>Link này sẽ hết hạn sau 10 phút.</p>
  `;

  await sendEmail(email, subject, html);
};