const mongoose = require('mongoose');
const Course = require('./src/models/Course');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edupro');

async function listCourses() {
  try {
    console.log('🔍 Listing all courses with their slugs...');
    
    const courses = await Course.find({})
      .select('title slug displayStatus status')
      .limit(20)
      .sort({ createdAt: -1 });
    
    if (courses.length > 0) {
      console.log(`\n✅ Found ${courses.length} courses:`);
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Slug: ${course.slug}`);
        console.log(`   Status: ${course.status} | Display: ${course.displayStatus}`);
        console.log('');
      });
    } else {
      console.log('❌ No courses found');
    }
    
    // Tìm khóa học có từ "phần mềm nhúng" hoặc "IoT"
    console.log('\n🔍 Searching for courses with "phần mềm nhúng" or "IoT"...');
    const searchCourses = await Course.find({
      $or: [
        { title: { $regex: 'phần mềm nhúng', $options: 'i' } },
        { title: { $regex: 'IoT', $options: 'i' } },
        { title: { $regex: 'embedded', $options: 'i' } },
        { slug: { $regex: 'phan-mem-nhung', $options: 'i' } },
        { slug: { $regex: 'iot', $options: 'i' } }
      ]
    });
    
    if (searchCourses.length > 0) {
      console.log(`\n🎯 Found ${searchCourses.length} matching courses:`);
      searchCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   Slug: ${course.slug}`);
        console.log(`   Status: ${course.status} | Display: ${course.displayStatus}`);
        console.log('');
      });
    } else {
      console.log('❌ No matching courses found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

listCourses();