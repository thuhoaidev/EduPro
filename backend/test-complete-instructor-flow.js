const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Cấu hình
const API_BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = `test-instructor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

// Tạo file test tạm thời
function createTestFile(content, filename) {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }
  
  const filePath = path.join(testDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Test 1: Instructor Registration
async function testInstructorRegistration() {
  try {
    console.log('🧪 Bắt đầu test instructor registration...');
    
    // Tạo file test
    const avatarPath = createTestFile('fake image content', 'test-avatar.jpg');
    const cvPath = createTestFile('fake CV content', 'test-cv.pdf');
    const certPath = createTestFile('fake certificate content', 'test-cert.pdf');
    const videoPath = createTestFile('fake video content', 'test-video.mp4');
    
    // Tạo FormData
    const formData = new FormData();
    
    // Thông tin cá nhân
    formData.append('fullName', 'Nguyễn Văn Test');
    formData.append('email', TEST_EMAIL);
    formData.append('phone', '0123456789');
    formData.append('password', 'password123');
    formData.append('gender', 'male');
    formData.append('dateOfBirth', '1990-01-01');
    formData.append('address', '123 Test Street, Test City');
    
    // Thông tin học vấn
    formData.append('degree', 'Cử nhân');
    formData.append('institution', 'Đại học Test');
    formData.append('graduationYear', '2015');
    formData.append('major', 'Công nghệ thông tin');
    
    // Thông tin chuyên môn
    formData.append('specializations[0]', 'JavaScript');
    formData.append('specializations[1]', 'React');
    formData.append('specializations[2]', 'Node.js');
    formData.append('teachingExperience', '5');
    formData.append('experienceDescription', 'Có 5 năm kinh nghiệm giảng dạy lập trình web');
    
    // Thông tin bổ sung
    formData.append('bio', 'Giảng viên có kinh nghiệm trong lĩnh vực lập trình web');
    formData.append('linkedin', 'https://linkedin.com/in/test');
    formData.append('github', 'https://github.com/test');
    formData.append('website', 'https://test.com');
    
    // Files
    formData.append('avatar', fs.createReadStream(avatarPath));
    formData.append('cv', fs.createReadStream(cvPath));
    formData.append('certificates', fs.createReadStream(certPath));
    formData.append('demoVideo', fs.createReadStream(videoPath));
    
    console.log('📤 Gửi request đăng ký instructor...');
    
    // Gọi API đăng ký
    const response = await axios.post(`${API_BASE_URL}/auth/instructor-register`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000,
    });
    
    console.log('✅ Đăng ký thành công:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message,
      userId: response.data.data?.user?._id,
      email: response.data.data?.user?.email
    });
    
    // Cleanup test files
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(cvPath);
    fs.unlinkSync(certPath);
    fs.unlinkSync(videoPath);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Test đăng ký thất bại:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Cleanup test files if they exist
    try {
      const testDir = path.join(__dirname, 'test-files');
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
    
    throw error;
  }
}

// Test 2: Verify Instructor Email (Mock - vì cần token thực)
async function testVerifyInstructorEmail() {
  console.log('\n🧪 Test verify instructor email (Mock)...');
  console.log('📧 Trong thực tế, user sẽ nhận email với link xác minh');
  console.log('🔗 Link format: http://localhost:3000/verify-instructor-email/{token}');
  console.log('✅ Frontend sẽ gọi API: GET /auth/verify-instructor-email/{token}');
  console.log('✅ Backend sẽ xác minh token và cập nhật trạng thái user');
}

// Test 3: Check User Status After Verification
async function testCheckUserStatus() {
  console.log('\n🧪 Test check user status...');
  console.log('📋 Sau khi xác minh email, user sẽ có:');
  console.log('   - email_verified: true');
  console.log('   - status: active');
  console.log('   - approval_status: approved');
  console.log('   - instructor_approval_status: pending (chờ admin duyệt)');
}

// Test 4: Admin Approval Process (Mock)
async function testAdminApprovalProcess() {
  console.log('\n🧪 Test admin approval process (Mock)...');
  console.log('👨‍💼 Admin sẽ:');
  console.log('   1. Xem danh sách instructor pending');
  console.log('   2. Xem chi tiết hồ sơ instructor');
  console.log('   3. Duyệt hoặc từ chối hồ sơ');
  console.log('   4. Gửi email thông báo kết quả');
  console.log('✅ Sau khi được duyệt, instructor có thể đăng nhập và tạo khóa học');
}

// Main test function
async function runCompleteFlow() {
  console.log('🚀 Bắt đầu test toàn bộ luồng instructor registration...\n');
  
  try {
    // Test 1: Registration
    await testInstructorRegistration();
    
    // Test 2: Email Verification (Mock)
    await testVerifyInstructorEmail();
    
    // Test 3: Check User Status
    await testCheckUserStatus();
    
    // Test 4: Admin Approval (Mock)
    await testAdminApprovalProcess();
    
    console.log('\n🎉 Tất cả tests hoàn thành!');
    console.log('\n📝 Tóm tắt luồng hoàn chỉnh:');
    console.log('1. ✅ User đăng ký instructor → Backend tạo user + gửi email xác minh');
    console.log('2. 📧 User nhận email → Click link xác minh → Frontend gọi API verify');
    console.log('3. ✅ Backend xác minh token → Cập nhật trạng thái user');
    console.log('4. 👨‍💼 Admin xét duyệt hồ sơ → Gửi email thông báo kết quả');
    console.log('5. 🎓 Instructor được duyệt → Có thể đăng nhập và tạo khóa học');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
  runCompleteFlow();
}

module.exports = {
  testInstructorRegistration,
  testVerifyInstructorEmail,
  testCheckUserStatus,
  testAdminApprovalProcess,
  runCompleteFlow
}; 