const axios = require('axios');

async function testStatusMapping() {
  try {
    const roleId = '68515bd8e39706d32b125f89'; // Role ID từ trước
    const baseURL = 'http://localhost:5000/api';

    console.log('🧪 Testing Status Mapping in Users by Role API...');
    console.log('📍 URL:', `${baseURL}/users/by-role/${roleId}`);

    const response = await axios.get(`${baseURL}/users/by-role/${roleId}`);

    console.log('✅ API Response:');
    console.log('   Status:', response.status);
    console.log('   Total users:', response.data.data.length);
    
    // Kiểm tra status mapping
    console.log('\n📊 Status Mapping Check:');
    response.data.data.forEach((user, index) => {
      console.log(`   User ${index + 1}: ${user.fullname}`);
      console.log(`   Status: ${user.status}`);
      console.log('   ---');
    });

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
setTimeout(testStatusMapping, 3000); 