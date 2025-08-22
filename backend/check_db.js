const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/edupro');

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Kiểm tra kết nối
    const db = mongoose.connection.db;
    console.log('✅ Connected to database:', db.databaseName);
    
    // Liệt kê tất cả collections
    const collections = await db.listCollections().toArray();
    console.log('\n📊 Collections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Đếm documents trong mỗi collection
    console.log('\n📈 Document counts:');
    for (const collection of collections) {
      try {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} documents`);
      } catch (err) {
        console.log(`- ${collection.name}: Error counting - ${err.message}`);
      }
    }
    
    // Kiểm tra cụ thể collection courses
    const coursesCount = await db.collection('courses').countDocuments();
    console.log(`\n🎯 Courses collection: ${coursesCount} documents`);
    
    if (coursesCount > 0) {
      // Lấy 5 khóa học đầu tiên
      const sampleCourses = await db.collection('courses').find({}).limit(5).toArray();
      console.log('\n📚 Sample courses:');
      sampleCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title || 'No title'}`);
        console.log(`   Slug: ${course.slug || 'No slug'}`);
        console.log(`   Display Status: ${course.displayStatus || 'No status'}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
