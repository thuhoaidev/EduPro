const axios = require('axios');

// Test enrollment API
async function testEnrollment() {
  try {
    const courseId = '6879caf1856109989beda9af';
    const response = await axios.post(`http://localhost:5000/api/courses/${courseId}/enroll`, {}, {
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE', // Cần thay thế bằng token thực
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Enrollment successful:', response.data);
  } catch (error) {
    console.log('❌ Enrollment failed:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Error:', error.message);
  }
}

// Test course status
async function testCourseStatus() {
  try {
    const courseId = '6879caf1856109989beda9af';
    const response = await axios.get(`http://localhost:5000/api/courses/${courseId}`);
    
    console.log('✅ Course details:');
    console.log('Status:', response.data.data.status);
    console.log('Display Status:', response.data.data.displayStatus);
    console.log('Price:', response.data.data.price);
  } catch (error) {
    console.log('❌ Failed to get course details:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
  }
}

// Run tests
console.log('Testing course status...');
testCourseStatus();

console.log('\nTesting enrollment (will fail without valid token)...');
testEnrollment(); 