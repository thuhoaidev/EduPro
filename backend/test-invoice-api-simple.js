const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';

async function testInvoiceAPI() {
  console.log('🧪 Testing Invoice API with real instructor...\n');

  try {
    // Test 1: Try to login with a real instructor
    console.log('1. Testing login with real instructor');
    
    const loginData = {
      identifier: 'nguyenthuhuong@gmail.com', // Instructor từ database
      password: '123456'
    };

    console.log('Trying to login with:', loginData.identifier);

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (loginResponse.data.success) {
      const token = loginResponse.data.token;
      console.log('✅ Login successful!');
      console.log('User ID:', loginResponse.data.user._id);
      console.log('User roles:', loginResponse.data.user.roles);
      console.log('User role_id:', loginResponse.data.user.role_id);
      
      // Test 2: Test invoice API
      console.log('\n2. Testing GET /invoices/my/invoices');
      try {
        const invoiceResponse = await axios.get(`${BASE_URL}/invoices/my/invoices`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Invoice API success!');
        console.log('Response:', invoiceResponse.data);
      } catch (error) {
        console.log('❌ Invoice API error:');
        console.log('Status:', error.response?.status);
        console.log('Message:', error.response?.data?.message);
        console.log('Data:', error.response?.data);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run test
testInvoiceAPI(); 