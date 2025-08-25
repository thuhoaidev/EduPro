const mongoose = require('mongoose');
const User = require('./src/models/User');
const Role = require('./src/models/Role');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixInstructorProfileStatus() {
  try {
    console.log('🔧 Fixing instructor_profile_status for existing instructors...\n');

    // Tìm role instructor
    const instructorRole = await Role.findOne({ name: 'instructor' });
    if (!instructorRole) {
      console.error('❌ Không tìm thấy role instructor');
      return;
    }

    // Tìm tất cả instructor
    const instructors = await User.find({ role_id: instructorRole._id });
    console.log(`📊 Tìm thấy ${instructors.length} instructor\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const instructor of instructors) {
      console.log(`👤 Processing: ${instructor.fullname} (${instructor.email})`);
      
      let needsUpdate = false;

      // Đảm bảo instructorInfo tồn tại
      if (!instructor.instructorInfo) {
        instructor.instructorInfo = {};
        needsUpdate = true;
        console.log(`   ✅ Tạo instructorInfo mới`);
      }

      // Kiểm tra và cập nhật instructor_profile_status
      if (!instructor.instructorInfo.instructor_profile_status) {
        // Nếu chưa có instructor_profile_status, set theo approval_status
        instructor.instructorInfo.instructor_profile_status = instructor.approval_status || 'pending';
        needsUpdate = true;
        console.log(`   ✅ Set instructor_profile_status: ${instructor.instructorInfo.instructor_profile_status}`);
      } else if (instructor.instructorInfo.instructor_profile_status !== instructor.approval_status) {
        // Nếu không khớp, ưu tiên approval_status
        console.log(`   ⚠️ Mismatch detected:`);
        console.log(`      instructor_profile_status: ${instructor.instructorInfo.instructor_profile_status}`);
        console.log(`      approval_status: ${instructor.approval_status}`);
        console.log(`   🔄 Syncing instructor_profile_status to match approval_status`);
        instructor.instructorInfo.instructor_profile_status = instructor.approval_status || 'pending';
        needsUpdate = true;
      }

      // Kiểm tra is_approved
      if (instructor.instructorInfo.is_approved === undefined || instructor.instructorInfo.is_approved === null) {
        instructor.instructorInfo.is_approved = instructor.approval_status === 'approved';
        needsUpdate = true;
        console.log(`   ✅ Set is_approved: ${instructor.instructorInfo.is_approved}`);
      }

      if (needsUpdate) {
        instructor.markModified('instructorInfo');
        await instructor.save();
        fixedCount++;
        console.log(`   ✅ Đã cập nhật`);
      } else {
        skippedCount++;
        console.log(`   ⏭️ Không cần cập nhật`);
      }
      console.log('---');
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Total instructors: ${instructors.length}`);
    console.log(`   Fixed: ${fixedCount}`);
    console.log(`   Skipped: ${skippedCount}`);

    // Kiểm tra kết quả
    const approvedInstructors = await User.find({
      role_id: instructorRole._id,
      'instructorInfo.instructor_profile_status': 'approved'
    });
    
    const pendingInstructors = await User.find({
      role_id: instructorRole._id,
      'instructorInfo.instructor_profile_status': 'pending'
    });

    const rejectedInstructors = await User.find({
      role_id: instructorRole._id,
      'instructorInfo.instructor_profile_status': 'rejected'
    });

    console.log(`\n📊 Status breakdown:`);
    console.log(`   Approved: ${approvedInstructors.length}`);
    console.log(`   Pending: ${pendingInstructors.length}`);
    console.log(`   Rejected: ${rejectedInstructors.length}`);

    console.log('\n🎉 Fix completed successfully!');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixInstructorProfileStatus();
