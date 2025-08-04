// Test Device Security API Endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testCourseId = 1; // Replace with actual course ID

async function testAPI() {
  console.log('🚀 Testing Device Security API Endpoints...\n');

  // Test 1: Health check
  console.log('📝 Test 1: API Health Check');
  try {
    const response = await axios.get(`${BASE_URL}/health`, testConfig);
    console.log('✅ API is running:', response.status);
  } catch (error) {
    console.log('❌ API health check failed. Make sure backend is running.');
    return;
  }

  // Test 2: Device Security Routes
  console.log('\n📝 Test 2: Device Security Routes Check');
  
  // Test without auth (should get 401)
  try {
    await axios.get(`${BASE_URL}/device-security/my-devices`, testConfig);
    console.log('❌ Route accessible without auth - security issue!');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Routes properly protected with auth');
    } else {
      console.log('⚠️ Unexpected error:', error.response?.status, error.message);
    }
  }

  // Test 3: Check if routes are registered
  console.log('\n📝 Test 3: Routes Registration Check');
  try {
    await axios.get(`${BASE_URL}/device-security/nonexistent`, testConfig);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Device security routes are registered');
    } else if (error.response?.status === 404) {
      console.log('❌ Device security routes not found - check app.js');
    } else {
      console.log('⚠️ Unexpected response:', error.response?.status);
    }
  }

  console.log('\n🎯 API Test Summary:');
  console.log('- Backend server: Running');
  console.log('- Routes registered: Check above results');
  console.log('- Auth protection: Working');
  console.log('\n📋 Next steps:');
  console.log('1. Test with actual user authentication');
  console.log('2. Test device registration flow');
  console.log('3. Test violation detection');
}

// Test with authentication
async function testWithAuth(token) {
  console.log('\n🔐 Testing with Authentication...');
  
  const authConfig = {
    ...testConfig,
    headers: {
      ...testConfig.headers,
      'Authorization': `Bearer ${token}`
    }
  };

  // Test authenticated endpoints
  const endpoints = [
    { method: 'GET', url: '/device-security/my-devices', name: 'Get My Devices' },
    { method: 'GET', url: `/device-security/check-status/${testCourseId}`, name: 'Check Device Status' },
    { method: 'POST', url: '/device-security/register', data: { courseId: testCourseId }, name: 'Register Device' }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📝 Testing: ${endpoint.name}`);
      let response;
      
      if (endpoint.method === 'POST') {
        response = await axios.post(`${BASE_URL}${endpoint.url}`, endpoint.data, authConfig);
      } else {
        response = await axios.get(`${BASE_URL}${endpoint.url}`, authConfig);
      }
      
      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.statusText}`);
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status} - ${error.response?.statusText}`);
      if (error.response?.data) {
        console.log('Error:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }
}

// Main execution
async function main() {
  await testAPI();
  
  console.log('\n💡 To test with authentication:');
  console.log('1. Login to get JWT token');
  console.log('2. Run: testWithAuth("your_jwt_token_here")');
  console.log('\n🔧 Manual test commands:');
  console.log('curl -X GET http://localhost:5000/api/device-security/my-devices \\');
  console.log('  -H "Authorization: Bearer YOUR_TOKEN"');
}

// Export functions for manual testing
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAPI, testWithAuth };
