const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Category = require('../src/models/Category');
const Course = require('../src/models/Course');

const sampleCourses = [
  {
    title: 'React từ cơ bản đến nâng cao',
    slug: 'react-tu-co-ban-den-nang-cao',
    description: 'Khóa học React toàn diện cho người mới bắt đầu',
    categoryName: 'Lập trình Web'
  },
  {
    title: 'Node.js Backend Development',
    slug: 'nodejs-backend-development',
    description: 'Xây dựng API và server với Node.js',
    categoryName: 'Lập trình Backend'
  },
  {
    title: 'Bảo mật ứng dụng web',
    slug: 'bao-mat-ung-dung-web',
    description: 'Học về bảo mật và an ninh mạng',
    categoryName: 'An ninh mạng'
  },
  {
    title: 'Machine Learning cơ bản',
    slug: 'machine-learning-co-ban',
    description: 'Giới thiệu về Machine Learning',
    categoryName: 'Trí tuệ nhân tạo & Deep Learning'
  },
  {
    title: 'MongoDB Database Design',
    slug: 'mongodb-database-design',
    description: 'Thiết kế cơ sở dữ liệu với MongoDB',
    categoryName: 'Cơ sở dữ liệu'
  },
  {
    title: 'Thuật toán và cấu trúc dữ liệu',
    slug: 'thuat-toan-va-cau-truc-du-lieu',
    description: 'Nền tảng của khoa học máy tính',
    categoryName: 'Khoa học máy tính'
  },
  {
    title: 'Agile Development',
    slug: 'agile-development',
    description: 'Phương pháp phát triển phần mềm Agile',
    categoryName: 'Kỹ thuật phần mềm'
  },
  {
    title: 'React Native Mobile App',
    slug: 'react-native-mobile-app',
    description: 'Phát triển ứng dụng di động với React Native',
    categoryName: 'Phát triển Mobile'
  },
  {
    title: 'Digital Marketing Strategy',
    slug: 'digital-marketing-strategy',
    description: 'Chiến lược marketing số hiệu quả',
    categoryName: 'Digital Marketing'
  },
  {
    title: 'Khởi nghiệp kinh doanh',
    slug: 'khoi-nghiep-kinh-doanh',
    description: 'Hướng dẫn khởi nghiệp từ A đến Z',
    categoryName: 'Kinh doanh'
  }
];

async function createSampleCourses() {
  try {
    console.log('🚀 Bắt đầu tạo khóa học mẫu...');
    
    for (const courseData of sampleCourses) {
      // Tìm category
      const category = await Category.findOne({ name: courseData.categoryName });
      if (!category) {
        console.log(`⚠️  Không tìm thấy category: ${courseData.categoryName}`);
        continue;
      }
      
      // Kiểm tra xem khóa học đã tồn tại chưa
      const existingCourse = await Course.findOne({ slug: courseData.slug });
      if (existingCourse) {
        console.log(`⚠️  Khóa học "${courseData.title}" đã tồn tại`);
        continue;
      }
      
      // Tạo khóa học mới
      const newCourse = new Course({
        title: courseData.title,
        slug: courseData.slug,
        description: courseData.description,
        category: category._id,
        status: 'approved',
        displayStatus: 'published',
        price: Math.floor(Math.random() * 500000) + 100000, // 100k - 600k
        instructor: '507f1f77bcf86cd799439011', // ID mẫu
        thumbnail: 'https://via.placeholder.com/300x200',
        level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        language: 'vi',
        duration: Math.floor(Math.random() * 20) + 5, // 5-25 giờ
        lessons: Math.floor(Math.random() * 50) + 10, // 10-60 bài học
        students: Math.floor(Math.random() * 1000) + 50, // 50-1050 học viên
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        reviews: Math.floor(Math.random() * 100) + 5 // 5-105 đánh giá
      });
      
      await newCourse.save();
      console.log(`✅ Đã tạo khóa học: "${courseData.title}" (Category: ${courseData.categoryName})`);
    }
    
    // Hiển thị thống kê
    console.log('\n📊 Thống kê khóa học theo danh mục:');
    const categories = await Category.find({ status: 'active' });
    
    for (const category of categories) {
      const courseCount = await Course.countDocuments({ 
        category: category._id,
        displayStatus: 'published'
      });
      if (courseCount > 0) {
        console.log(`   ${category.name}: ${courseCount} khóa học`);
      }
    }
    
    const totalCourses = await Course.countDocuments({ displayStatus: 'published' });
    console.log(`\n✅ Hoàn thành! Tổng cộng ${totalCourses} khóa học đã publish.`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo khóa học mẫu:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
createSampleCourses(); 