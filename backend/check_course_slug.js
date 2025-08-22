const mongoose = require('mongoose');
const Course = require('./src/models/Course');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkCourse() {
  try {
    const slug = 'phan-mem-nhung-and-iot-tu-co-ban-den-nang-cao';
    
    console.log(`🔍 Searching for course with slug: ${slug}`);
    
    const course = await Course.findOne({ slug }).populate('instructor');
    
    if (course) {
      console.log('✅ Course found:');
      console.log('- ID:', course._id);
      console.log('- Title:', course.title);
      console.log('- Slug:', course.slug);
      console.log('- Display Status:', course.displayStatus);
      console.log('- Status:', course.status);
      console.log('- Instructor:', course.instructor?.user?.fullname || 'N/A');
    } else {
      console.log('❌ Course not found');
      
      // Check if there are any courses with similar slugs
      const similarCourses = await Course.find({ 
        slug: { $regex: 'phan-mem-nhung', $options: 'i' } 
      }).limit(5);
      
      if (similarCourses.length > 0) {
        console.log('\n🔍 Found similar courses:');
        similarCourses.forEach(c => {
          console.log(`- ${c.slug} (${c.title})`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCourse();
