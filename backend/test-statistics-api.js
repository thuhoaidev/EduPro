const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// Thay thế bằng token admin thực tế
const ADMIN_TOKEN = 'your_admin_token_here';

const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testStatisticsAPI() {
  console.log('🧪 Testing Statistics API...\n');

  try {
    // Test 1: Lấy thống kê tổng quan
    console.log('1. Testing Overview Statistics...');
    const overviewResponse = await axios.get(`${API_BASE_URL}/statistics/overview`, { headers });
    console.log('✅ Overview Statistics:', overviewResponse.data);
    console.log('');

    // Test 2: Lấy dữ liệu doanh thu
    console.log('2. Testing Revenue Data...');
    const revenueResponse = await axios.get(`${API_BASE_URL}/statistics/revenue?days=7`, { headers });
    console.log('✅ Revenue Data (7 days):', revenueResponse.data.data.length, 'records');
    console.log('');

    // Test 3: Lấy top khóa học
    console.log('3. Testing Top Courses...');
    const topCoursesResponse = await axios.get(`${API_BASE_URL}/statistics/top-courses?limit=3`, { headers });
    console.log('✅ Top Courses:', topCoursesResponse.data.data.length, 'courses');
    console.log('');

    // Test 4: Lấy thống kê danh mục
    console.log('4. Testing Category Statistics...');
    const categoryResponse = await axios.get(`${API_BASE_URL}/statistics/categories`, { headers });
    console.log('✅ Category Statistics:', categoryResponse.data.data.length, 'categories');
    console.log('');

    // Test 5: Lấy thống kê theo tháng
    console.log('5. Testing Monthly Statistics...');
    const monthlyResponse = await axios.get(`${API_BASE_URL}/statistics/monthly?year=2024`, { headers });
    console.log('✅ Monthly Statistics:', monthlyResponse.data.data.length, 'months');
    console.log('');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 Make sure to set a valid ADMIN_TOKEN in the script');
    }
  }
}

// Test validation errors
async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...\n');

  try {
    // Test invalid days parameter
    console.log('1. Testing invalid days parameter...');
    await axios.get(`${API_BASE_URL}/statistics/revenue?days=1000`, { headers });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation error caught for invalid days');
    }
  }

  try {
    // Test invalid limit parameter
    console.log('2. Testing invalid limit parameter...');
    await axios.get(`${API_BASE_URL}/statistics/top-courses?limit=100`, { headers });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation error caught for invalid limit');
    }
  }

  try {
    // Test invalid year parameter
    console.log('3. Testing invalid year parameter...');
    await axios.get(`${API_BASE_URL}/statistics/monthly?year=2019`, { headers });
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation error caught for invalid year');
    }
  }

  console.log('\n🎉 Validation tests completed!');
}

// Test without authentication
async function testAuthentication() {
  console.log('\n🧪 Testing Authentication...\n');

  try {
    console.log('1. Testing without token...');
    await axios.get(`${API_BASE_URL}/statistics/overview`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentication required - no token');
    }
  }

  try {
    console.log('2. Testing with invalid token...');
    await axios.get(`${API_BASE_URL}/statistics/overview`, {
      headers: { 'Authorization': 'Bearer invalid_token' }
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authentication required - invalid token');
    }
  }

  console.log('\n🎉 Authentication tests completed!');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Statistics API Tests\n');
  
  await testStatisticsAPI();
  await testValidationErrors();
  await testAuthentication();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testStatisticsAPI,
  testValidationErrors,
  testAuthentication,
  runAllTests
}; 