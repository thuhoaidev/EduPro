const axios = require('axios');

async function testUsersByRole() {
  try {
    const roleId = '68515bd8e39706d32b125f89'; // Role ID từ trước
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🧪 Testing Users by Role API...');
    console.log('📍 URL:', `${baseURL}/users/by-role/${roleId}`);
    
    const response = await axios.get(`${baseURL}/users/by-role/${roleId}`);
    
    console.log('✅ API Response:');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ API Error:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('   Message:', error.message);
    }
  }
}

// Đợi một chút để backend khởi động
setTimeout(testUsersByRole, 3000); 