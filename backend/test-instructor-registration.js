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

// Test instructor registration
async function testInstructorRegistration() {
  try {
    console.log('🧪 Bắt đầu test instructor registration...');
    
    // Tạo file test
    const avatarPath = createTestFile('fake image content', 'test-avatar.jpg');
    const cvPath = createTestFile('fake CV content', 'test-cv.pdf');
    const certPath = createTestFile('fake certificate content', 'test-cert.pdf');
    
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
    formData.append('specializations', 'JavaScript');
    formData.append('specializations', 'React');
    formData.append('specializations', 'Node.js');
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
    
    console.log('📤 Gửi request đến API...');
    
    // Gọi API
    const response = await axios.post(`${API_BASE_URL}/auth/instructor-register`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000, // 30 seconds
    });
    
    console.log('✅ Response:', {
      status: response.status,
      success: response.data.success,
      message: response.data.message,
      data: response.data.data
    });
    
    // Cleanup test files
    fs.unlinkSync(avatarPath);
    fs.unlinkSync(cvPath);
    fs.unlinkSync(certPath);
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Test failed:', {
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

// Test validation errors
async function testValidationErrors() {
  console.log('\n🧪 Test validation errors...');
  
  try {
    const formData = new FormData();
    
    // Chỉ gửi một số trường để test validation
    formData.append('fullName', 'Test User');
    formData.append('email', 'invalid-email');
    formData.append('password', '123'); // Too short
    
    const response = await axios.post(`${API_BASE_URL}/auth/instructor-register`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('❌ Expected validation error but got success');
    
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation error caught correctly:', {
        status: error.response.status,
        message: error.response.data.message,
        missing: error.response.data.missing
      });
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Bắt đầu test instructor registration API...\n');
  
  try {
    // Test 1: Successful registration
    await testInstructorRegistration();
    
    // Test 2: Validation errors
    await testValidationErrors();
    
    console.log('\n🎉 Tất cả tests hoàn thành!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Chạy tests nếu file được execute trực tiếp
if (require.main === module) {
  runTests();
}

module.exports = {
  testInstructorRegistration,
  testValidationErrors,
  runTests
}; 
testInstructorRegistration(); 