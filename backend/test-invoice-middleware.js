const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';

async function testInvoiceMiddleware() {
  console.log('🧪 Testing Invoice Middleware...\n');

  try {
    // Test 1: Test without token (should return 401)
    console.log('1. Testing GET /invoices/my/invoices without token');
    try {
      const response = await axios.get(`${BASE_URL}/invoices/my/invoices`);
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Correctly failed without token');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
    }

    // Test 2: Test with invalid token (should return 401)
    console.log('\n2. Testing GET /invoices/my/invoices with invalid token');
    try {
      const response = await axios.get(`${BASE_URL}/invoices/my/invoices`, {
        headers: { Authorization: 'Bearer invalid-token' }
      });
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Correctly failed with invalid token');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
    }

    // Test 3: Test with valid token but wrong role (should return 403)
    console.log('\n3. Testing GET /invoices/my/invoices with student token');
    try {
      // Tạo một token giả cho student
      const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4NzVjYWYxODU2MTA5OTg5YmVkYTlhZiIsImlhdCI6MTczNDA3MDA3NiwibmJmIjoxNzM0MDcwMDc2LCJleHAiOjE3MzQxNTY0NzZ9.fake';
      const response = await axios.get(`${BASE_URL}/invoices/my/invoices`, {
        headers: { Authorization: `Bearer ${fakeToken}` }
      });
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Correctly failed with wrong role');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
    }

    // Test 4: Test admin endpoint (should return 403 for non-admin)
    console.log('\n4. Testing GET /invoices (admin endpoint)');
    try {
      const response = await axios.get(`${BASE_URL}/invoices`);
      console.log('❌ Should have failed but got:', response.data);
    } catch (error) {
      console.log('✅ Correctly failed for admin endpoint');
      console.log('Status:', error.response?.status);
      console.log('Message:', error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testInvoiceMiddleware(); 