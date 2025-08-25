const axios = require('axios');

// Cấu hình axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token test - thay thế bằng token thực tế của instructor
const INSTRUCTOR_TOKEN = 'YOUR_INSTRUCTOR_TOKEN_HERE';

// Test function
async function testInstructorDashboard() {
  console.log('🧪 Testing Instructor Dashboard APIs...\n');

  try {
    // Test 1: Lấy thống kê tổng quan
    console.log('1. Testing Dashboard Stats API...');
    const statsResponse = await api.get('/instructor/dashboard/stats', {
      headers: { Authorization: `Bearer ${INSTRUCTOR_TOKEN}` }
    });
    
    if (statsResponse.data.success) {
      console.log('✅ Dashboard Stats API working');
      console.log('📊 Overview:', statsResponse.data.data.overview);
      console.log('📈 Monthly Earnings:', statsResponse.data.data.monthlyEarnings.length, 'months');
      console.log('🏆 Top Courses:', statsResponse.data.data.topCourses.length, 'courses');
      console.log('👥 Recent Enrollments:', statsResponse.data.data.recentEnrollments.length, 'days');
    } else {
      console.log('❌ Dashboard Stats API failed:', statsResponse.data.message);
    }

    // Test 2: Lấy thống kê thu nhập (nếu có khóa học)
    console.log('\n2. Testing Earnings Analytics API...');
    const earningsResponse = await api.get('/instructor/dashboard/earnings?period=30', {
      headers: { Authorization: `Bearer ${INSTRUCTOR_TOKEN}` }
    });
    
    if (earningsResponse.data.success) {
      console.log('✅ Earnings Analytics API working');
      console.log('💰 Total Earnings:', earningsResponse.data.data.totalEarnings);
      console.log('📊 Total Transactions:', earningsResponse.data.data.totalTransactions);
      console.log('📈 Daily Earnings:', earningsResponse.data.data.dailyEarnings.length, 'days');
      console.log('🏆 Top Courses by Earnings:', earningsResponse.data.data.topCourses.length, 'courses');
    } else {
      console.log('❌ Earnings Analytics API failed:', earningsResponse.data.message);
    }

    // Test 3: Lấy thống kê khóa học (nếu có khóa học)
    if (statsResponse.data.success && statsResponse.data.data.topCourses.length > 0) {
      const courseId = statsResponse.data.data.topCourses[0]._id;
      console.log(`\n3. Testing Course Analytics API for course: ${courseId}...`);
      
      const courseAnalyticsResponse = await api.get(`/instructor/dashboard/course/${courseId}/analytics`, {
        headers: { Authorization: `Bearer ${INSTRUCTOR_TOKEN}` }
      });
      
      if (courseAnalyticsResponse.data.success) {
        console.log('✅ Course Analytics API working');
        console.log('📚 Course:', courseAnalyticsResponse.data.data.course.title);
        console.log('👥 Total Enrollments:', courseAnalyticsResponse.data.data.analytics.totalEnrollments);
        console.log('✅ Completed Enrollments:', courseAnalyticsResponse.data.data.analytics.completedEnrollments);
        console.log('📊 Completion Rate:', courseAnalyticsResponse.data.data.analytics.completionRate + '%');
      } else {
        console.log('❌ Course Analytics API failed:', courseAnalyticsResponse.data.message);
      }
    } else {
      console.log('\n3. Skipping Course Analytics API test (no courses available)');
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to set a valid INSTRUCTOR_TOKEN in the script');
    }
    
    if (error.response?.status === 404) {
      console.log('\n💡 Tip: Make sure the instructor has a profile and courses');
    }
  }
}

// Test error cases
async function testErrorCases() {
  console.log('\n🧪 Testing Error Cases...\n');

  try {
    // Test 1: Không có token
    console.log('1. Testing without token...');
    try {
      await api.get('/instructor/dashboard/stats');
      console.log('❌ Should have failed without token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected without token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test 2: Token không hợp lệ
    console.log('\n2. Testing with invalid token...');
    try {
      await api.get('/instructor/dashboard/stats', {
        headers: { Authorization: 'Bearer invalid_token' }
      });
      console.log('❌ Should have failed with invalid token');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly rejected invalid token');
      } else {
        console.log('❌ Unexpected error:', error.response?.status);
      }
    }

    // Test 3: Không phải instructor
    console.log('\n3. Testing with non-instructor token...');
    // Note: This would need a valid non-instructor token to test properly
    console.log('⚠️  Skipped (requires non-instructor token)');

  } catch (error) {
    console.error('❌ Error case test failed:', error.message);
  }
}

// Main function
async function main() {
  console.log('🚀 Starting Instructor Dashboard API Tests\n');
  
  if (INSTRUCTOR_TOKEN === 'YOUR_INSTRUCTOR_TOKEN_HERE') {
    console.log('⚠️  Please set a valid INSTRUCTOR_TOKEN in the script before running tests');
    console.log('💡 You can get a token by logging in as an instructor');
    return;
  }

  await testInstructorDashboard();
  await testErrorCases();
}

// Run tests
main().catch(console.error);
