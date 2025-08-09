const axios = require('axios');

// Test tạo khóa học
async function testCreateCourse() {
  try {
    const courseData = {
      title: 'Khóa học test',
      description: 'Mô tả khóa học test với ít nhất 10 ký tự',
      category: '507f1f77bcf86cd799439011', // ObjectId hợp lệ
      level: 'beginner',
      language: 'vi',
      price: 100000,
      discount_amount: 0,
      discount_percentage: 0,
      requirements: ['Yêu cầu 1', 'Yêu cầu 2'],
      sections: []
    };

    console.log('Đang test tạo khóa học...');
    console.log('Dữ liệu gửi:', JSON.stringify(courseData, null, 2));

    const response = await axios.post('http://localhost:5000/api/courses', courseData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Thay bằng token thực
      }
    });

    console.log('✅ Thành công!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Lỗi:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCreateCourse(); 