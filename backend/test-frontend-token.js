const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';

async function testFrontendToken() {
  console.log('🧪 Testing with frontend token...\n');

  // Token này sẽ được copy từ localStorage của frontend
  const frontendToken = 'PASTE_YOUR_TOKEN_HERE'; // Thay thế bằng token thực từ frontend
  
  if (frontendToken === 'PASTE_YOUR_TOKEN_HERE') {
    console.log('❌ Please replace the token with a real token from frontend localStorage');
    console.log('To get the token:');
    console.log('1. Open browser developer tools');
    console.log('2. Go to Application/Storage tab');
    console.log('3. Find localStorage');
    console.log('4. Copy the "token" value');
    console.log('5. Replace PASTE_YOUR_TOKEN_HERE with the actual token');
    return;
  }

  try {
    console.log('Testing GET /invoices/my/invoices with frontend token');
    
    const response = await axios.get(`${BASE_URL}/invoices/my/invoices`, {
      headers: { Authorization: `Bearer ${frontendToken}` }
    });
    
    console.log('✅ Success!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ Error:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Data:', error.response?.data);
  }
}

// Run test
testFrontendToken(); 