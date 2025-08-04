// Test script cho Device Security API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';

// Test data
const testUser1 = {
  email: 'testuser1@example.com',
  password: 'password123'
};

const testUser2 = {
  email: 'testuser2@example.com', 
  password: 'password123'
};

const testCourseId = '507f1f77bcf86cd799439011'; // Replace with actual course ID

// Helper function to login and get token
async function login(email, password) {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email,
      password
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test device registration
async function testDeviceRegistration(token, courseId) {
  try {
    console.log('\n🧪 Testing device registration...');
    const response = await axios.post(
      `${BASE_URL}/device-security/register`,
      { courseId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Device registration successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Device registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

// Test device status check
async function testDeviceStatus(token, courseId) {
  try {
    console.log('\n🧪 Testing device status check...');
    const response = await axios.get(
      `${BASE_URL}/device-security/check-status/${courseId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Device status check successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Device status check failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test get user devices
async function testGetUserDevices(token) {
  try {
    console.log('\n🧪 Testing get user devices...');
    const response = await axios.get(
      `${BASE_URL}/device-security/my-devices`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Get user devices successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get user devices failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Test get violations (admin)
async function testGetViolations(adminToken) {
  try {
    console.log('\n🧪 Testing get violations (admin)...');
    const response = await axios.get(
      `${BASE_URL}/device-security/violations`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ Get violations successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get violations failed:', error.response?.data?.message || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Device Security API Tests...\n');

  // Test 1: Login with first user
  console.log('📝 Test 1: Login with first user');
  const token1 = await login(testUser1.email, testUser1.password);
  if (!token1) {
    console.log('⚠️ Skipping tests - login failed. Make sure test users exist.');
    return;
  }

  // Test 2: Register device for first user
  console.log('\n📝 Test 2: Register device for first user');
  await testDeviceRegistration(token1, testCourseId);

  // Test 3: Check device status for first user
  console.log('\n📝 Test 3: Check device status for first user');
  await testDeviceStatus(token1, testCourseId);

  // Test 4: Get devices for first user
  console.log('\n📝 Test 4: Get devices for first user');
  await testGetUserDevices(token1);

  // Test 5: Login with second user (same browser/device)
  console.log('\n📝 Test 5: Login with second user');
  const token2 = await login(testUser2.email, testUser2.password);
  if (!token2) {
    console.log('⚠️ Skipping violation test - second user login failed');
    return;
  }

  // Test 6: Try to register device for second user (should trigger violation)
  console.log('\n📝 Test 6: Try to register device for second user (should trigger violation)');
  await testDeviceRegistration(token2, testCourseId);

  console.log('\n🎉 Device Security API Tests Completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Check MongoDB for user_devices and device_violations collections');
  console.log('2. Test the frontend UI by accessing course pages');
  console.log('3. Test admin dashboard for violation management');
}

// Run tests
runTests().catch(console.error);

// Export for use in other files
module.exports = {
  login,
  testDeviceRegistration,
  testDeviceStatus,
  testGetUserDevices,
  testGetViolations
};
