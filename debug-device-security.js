// Debug Device Security System
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugDeviceSecurity() {
  console.log('🔍 Debugging Device Security System...\n');

  // Test 1: Check if backend is running
  console.log('📝 Test 1: Backend Health Check');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is running');
  } catch (error) {
    console.log('❌ Backend is not running. Please start with: cd backend && npm start');
    return;
  }

  // Test 2: Check device security routes
  console.log('\n📝 Test 2: Device Security Routes');
  try {
    const response = await axios.get(`${BASE_URL}/device-security/my-devices`);
    console.log('❌ Routes accessible without auth - this should not happen');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Device security routes are protected');
    } else if (error.response?.status === 404) {
      console.log('❌ Device security routes not found - check app.js registration');
    } else {
      console.log('⚠️ Unexpected error:', error.message);
    }
  }

  // Test 3: Manual device registration test
  console.log('\n📝 Test 3: Manual Device Registration Test');
  console.log('To test device registration:');
  console.log('1. Login to get JWT token');
  console.log('2. Run this curl command:');
  console.log(`curl -X POST ${BASE_URL}/device-security/register \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\');
  console.log('  -d \'{"courseId": 1}\'');

  // Test 4: Check MongoDB connection
  console.log('\n📝 Test 4: Database Check');
  console.log('Check MongoDB collections:');
  console.log('- userdevices: Should store registered devices');
  console.log('- deviceviolations: Should store violations');
  console.log('Use MongoDB Compass or CLI to verify data');

  console.log('\n🎯 Next Steps:');
  console.log('1. Ensure backend is running with device security routes');
  console.log('2. Test frontend CourseAccessWrapper integration');
  console.log('3. Check browser console for device security logs');
  console.log('4. Verify MongoDB collections have data');
}

// Helper function to test with authentication
async function testWithAuth(token, courseId = 1) {
  console.log('\n🔐 Testing with Authentication...');
  
  const authConfig = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    // Test device status check
    console.log('\n📝 Testing: Check Device Status');
    const statusResponse = await axios.get(
      `${BASE_URL}/device-security/check-status/${courseId}`,
      authConfig
    );
    console.log('✅ Device Status:', statusResponse.data);

    // Test device registration
    console.log('\n📝 Testing: Register Device');
    const registerResponse = await axios.post(
      `${BASE_URL}/device-security/register`,
      { courseId },
      authConfig
    );
    console.log('✅ Device Registration:', registerResponse.data);

    // Test get my devices
    console.log('\n📝 Testing: Get My Devices');
    const devicesResponse = await axios.get(
      `${BASE_URL}/device-security/my-devices`,
      authConfig
    );
    console.log('✅ My Devices:', devicesResponse.data);

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

// Main execution
if (require.main === module) {
  debugDeviceSecurity().catch(console.error);
}

module.exports = { debugDeviceSecurity, testWithAuth };
