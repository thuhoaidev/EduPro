const axios = require('axios');
const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupo', {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000
});

// Test API đánh giá khóa học
async function testReviewAPI() {
  try {
    console.log('🧪 Testing Course Review API...');
    
    // Lấy course ID thực từ database
    const Course = require('./src/models/Course');
    const courses = await Course.find().limit(1);
    
    if (courses.length === 0) {
      console.log('❌ Không có khóa học nào trong database');
      return;
    }
    
    const courseId = courses[0]._id;
    console.log('📚 Using course ID:', courseId);
    
    // Test 1: Lấy reviews của khóa học (public route)
    console.log('\n1. Testing GET /api/course-reviews/:courseId/reviews (public)');
    try {
      const response = await axios.get(`http://localhost:5000/api/course-reviews/${courseId}/reviews`);
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }
    
    // Test 2: Lấy my review (protected route - cần token)
    console.log('\n2. Testing GET /api/course-reviews/:courseId/my-review (protected)');
    try {
      const response = await axios.get(`http://localhost:5000/api/course-reviews/${courseId}/my-review`);
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error (expected for protected route):', error.response?.data || error.message);
    }
    
    // Test 3: Thêm review (protected route - cần token)
    console.log('\n3. Testing POST /api/course-reviews/:courseId/review (protected)');
    try {
      const response = await axios.post(`http://localhost:5000/api/course-reviews/${courseId}/review`, {
        rating: 5,
        comment: 'Test review from script'
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error (expected for protected route):', error.response?.data || error.message);
    }
    
    console.log('\n🎯 Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Chạy test
testReviewAPI();
