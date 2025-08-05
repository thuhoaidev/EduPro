const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';

async function testInstructorLogin() {
  console.log('🧪 Testing Instructor Login...\n');

  try {
    // Test login với instructor thực tế
    console.log('1. Testing instructor login');
    
    // Sử dụng email thực tế từ database
    const loginData = {
      identifier: 'instructor@certificate.com', // Sử dụng 'identifier' thay vì 'email'
      password: '123456' // Password mặc định thường là 123456
    };

    console.log('Trying to login with:', loginData.identifier);

    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (response.data.success) {
      const token = response.data.token;
      console.log('✅ Login successful!');
      console.log('Token:', token.substring(0, 50) + '...');
      console.log('User ID:', response.data.user._id);
      console.log('User roles:', response.data.user.roles);
      console.log('User role_id:', response.data.user.role_id);
      
      // Test API invoices với token này
      console.log('\n2. Testing invoice API with token');
      
      try {
        const invoiceResponse = await axios.get(`${BASE_URL}/invoices/my/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Invoice API success:', invoiceResponse.data);
      } catch (error) {
        console.log('❌ Invoice API error:', error.response?.data || error.message);
        console.log('Status:', error.response?.status);
      }
      
    } else {
      console.log('❌ Login failed:', response.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests
testInstructorLogin(); 