const nodemailer = require('nodemailer');
require('dotenv').config();

// Tạo transporter
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test email configuration
async function testEmailConfig() {
  console.log('🔧 Testing email configuration...');
  console.log('📧 Email Host:', process.env.EMAIL_HOST);
  console.log('🔌 Email Port:', process.env.EMAIL_PORT);
  console.log('🔒 Email Secure:', process.env.EMAIL_SECURE);
  console.log('👤 Email User:', process.env.EMAIL_USER);
  console.log('📝 Email From:', process.env.EMAIL_FROM);
  console.log('🏷️ Email From Name:', process.env.EMAIL_FROM_NAME);
  console.log('');

  try {
    // Verify connection
    console.log('🔍 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    console.log('');

    // Send test email
    console.log('📤 Sending test email...');
    const testEmail = process.env.EMAIL_USER; // Gửi cho chính mình
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EduPro Platform'}" <${process.env.EMAIL_FROM}>`,
      to: testEmail,
      subject: '🧪 Test Email - EduPro Platform',
      html: `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Email - EduPro</title>
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
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 1px solid #0ea5e9;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              color: #0c4a6e;
            }
            .footer {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              padding: 30px;
              text-align: center;
              color: #64748b;
              font-size: 14px;
              border-top: 1px solid #e2e8f0;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: white;
              margin-bottom: 8px;
            }
            .steps {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              border: 1px solid #94a3b8;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
            }
            .steps h4 {
              color: #334155;
              margin: 0 0 16px 0;
              font-size: 16px;
              font-weight: 600;
            }
            .steps ul {
              margin: 0;
              padding-left: 20px;
              color: #475569;
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
              <h1>Test Email</h1>
              <div class="subtitle">Kiểm tra cấu hình SMTP</div>
            </div>
            <div class="content">
              <div class="success-box">
                <div class="success-content">
                  <strong>Thành công!</strong> Cấu hình email SMTP của bạn đã hoạt động chính xác.
                </div>
              </div>
              
              <div class="info-box">
                <strong>📋 Thông tin cấu hình:</strong><br>
                • Host: ${process.env.EMAIL_HOST}<br>
                • Port: ${process.env.EMAIL_PORT}<br>
                • Secure: ${process.env.EMAIL_SECURE}<br>
                • From: ${process.env.EMAIL_FROM}<br>
                • Time: ${new Date().toLocaleString('vi-VN')}
              </div>
              
              <p>Email này được gửi để kiểm tra cấu hình SMTP cho hệ thống EduPro. 
              Nếu bạn nhận được email này, có nghĩa là cấu hình email đã hoạt động chính xác!</p>
              
              <div class="steps">
                <h4>🎯 Bước tiếp theo:</h4>
                <ul>
                  <li>Bạn có thể test đăng ký giảng viên</li>
                  <li>Email verification sẽ được gửi tự động</li>
                  <li>Kiểm tra inbox và spam folder</li>
                  <li>Verify email verification flow</li>
                </ul>
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

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Email sent to:', testEmail);
    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. Check your email inbox');
    console.log('2. Check spam folder if not found');
    console.log('3. Test instructor registration');
    console.log('4. Verify email verification flow');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Check EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE');
    console.log('2. Verify EMAIL_USER and EMAIL_PASS');
    console.log('3. For Gmail: Use App Password instead of regular password');
    console.log('4. Check firewall and network connection');
    console.log('5. Try different port (465 with secure=true)');
  }
}

// Test instructor verification email
async function testInstructorVerificationEmail() {
  console.log('📧 Testing instructor verification email...');
  
  const testEmail = process.env.EMAIL_USER;
  const testName = 'Test User';
  const testToken = 'test-verification-token-123456';
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-instructor-email/${testToken}`;
  
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'EduPro Platform'}" <${process.env.EMAIL_FROM}>`,
      to: testEmail,
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
              <div class="greeting">Xin chào ${testName}!</div>
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

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Instructor verification email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('🔗 Verification URL:', verificationUrl);

  } catch (error) {
    console.error('❌ Instructor verification email failed:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting email configuration test...');
  console.log('=====================================');
  console.log('');

  // Test basic email configuration
  await testEmailConfig();
  
  console.log('');
  console.log('=====================================');
  
  // Test instructor verification email
  await testInstructorVerificationEmail();
  
  console.log('');
  console.log('🏁 Email test completed!');
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  testEmailConfig,
  testInstructorVerificationEmail
}; 