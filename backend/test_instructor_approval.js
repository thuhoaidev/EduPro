const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testInstructorApproval() {
  try {
    console.log('🧪 Testing instructor approval logic...\n');

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.error('❌ Không tìm thấy role instructor');
      return;
    }

    // Tìm một instructor để test
    const testInstructor = await User.findOne({ 
      role_id: instructorRole._id,
      'instructorInfo.instructor_profile_status': 'pending'
    }).populate('role_id');

    if (!testInstructor) {
      console.log('ℹ️ Không tìm thấy instructor có trạng thái pending để test');
      return;
    }

    console.log(`👤 Test instructor: ${testInstructor.fullname} (${testInstructor.email})`);
    console.log(`   Current approval_status: ${testInstructor.approval_status}`);
    console.log(`   Current instructor_profile_status: ${testInstructor.instructorInfo?.instructor_profile_status}`);
    console.log(`   Current is_approved: ${testInstructor.instructorInfo?.is_approved}`);

    // Simulate approval
    console.log('\n✅ Simulating approval...');
    
    // Cập nhật trạng thái như trong controller
    testInstructor.approval_status = 'approved';
    testInstructor.isInstructor = true;

    if (!testInstructor.instructorInfo) {
      testInstructor.instructorInfo = {};
    }
    testInstructor.instructorInfo.is_approved = true;
    testInstructor.instructorInfo.instructor_profile_status = 'approved';
    testInstructor.instructorInfo.approval_date = new Date();
    testInstructor.instructorInfo.rejection_reason = null;
    testInstructor.markModified('instructorInfo');

    await testInstructor.save();

    console.log('✅ Approval completed!');
    console.log(`   New approval_status: ${testInstructor.approval_status}`);
    console.log(`   New instructor_profile_status: ${testInstructor.instructorInfo.instructor_profile_status}`);
    console.log(`   New is_approved: ${testInstructor.instructorInfo.is_approved}`);

    // Test API response mapping
    console.log('\n🔍 Testing API response mapping...');
    const info = testInstructor.instructorInfo || {};
    const mappedApprovalStatus = info.instructor_profile_status || testInstructor.approval_status || 'pending';
    console.log(`   Mapped approvalStatus: ${mappedApprovalStatus}`);

    if (mappedApprovalStatus === 'approved') {
      console.log('✅ API response mapping works correctly!');
    } else {
      console.log('❌ API response mapping issue detected!');
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

testInstructorApproval();
