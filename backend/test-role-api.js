const axios = require('axios');

async function testRoleAPI() {
  try {
    const roleId = '68515bd8e39706d32b125f89';
    const baseURL = 'http://localhost:5000/api';
    
    console.log('🧪 Testing Role API...');
    console.log('📍 URL:', `${baseURL}/roles/${roleId}`);
    
    const response = await axios.get(`${baseURL}/roles/${roleId}`);
    
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
setTimeout(testRoleAPI, 3000); 