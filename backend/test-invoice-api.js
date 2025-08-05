const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual token

async function testInvoiceAPI() {
  console.log('🧪 Testing Invoice API...\n');

  try {
    // Test 1: Get all invoices (admin)
    console.log('1. Testing GET /invoices (admin)');
    try {
      const response = await axios.get(`${BASE_URL}/invoices`, {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 2: Get my invoices (instructor)
    console.log('\n2. Testing GET /invoices/my/invoices (instructor)');
    try {
      const response = await axios.get(`${BASE_URL}/invoices/my/invoices`, {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 3: Get invoice by ID
    console.log('\n3. Testing GET /invoices/:id');
    try {
      const response = await axios.get(`${BASE_URL}/invoices/test-id`, {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` }
      });
      console.log('✅ Success:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

    // Test 4: Download invoice
    console.log('\n4. Testing GET /invoices/download/:fileName');
    try {
      const response = await axios.get(`${BASE_URL}/invoices/download/test-file.pdf`, {
        headers: { Authorization: `Bearer ${TEST_TOKEN}` },
        responseType: 'blob'
      });
      console.log('✅ Success: File downloaded');
    } catch (error) {
      console.log('❌ Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testInvoiceAPI(); 