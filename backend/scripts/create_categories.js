const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const Category = require('../src/models/Category');

const categories = [
  {
    name: 'Lập trình Web',
    description: 'Khóa học về phát triển web frontend và backend',
    status: 'active'
  },
  {
    name: 'Lập trình Backend',
    description: 'Khóa học về phát triển backend, API và server-side programming',
    status: 'active'
  },
  {
    name: 'An ninh mạng',
    description: 'Khóa học về bảo mật thông tin và an ninh mạng',
    status: 'active'
  },
  {
    name: 'Trí tuệ nhân tạo & Deep Learning',
    description: 'Khóa học về AI, Machine Learning và Deep Learning',
    status: 'active'
  },
  {
    name: 'Cơ sở dữ liệu',
    description: 'Khóa học về thiết kế và quản lý cơ sở dữ liệu',
    status: 'active'
  },
  {
    name: 'Khoa học máy tính',
    description: 'Khóa học về các nguyên lý cơ bản của khoa học máy tính',
    status: 'active'
  },
  {
    name: 'Kỹ thuật phần mềm',
    description: 'Khóa học về quy trình phát triển phần mềm và quản lý dự án',
    status: 'active'
  },
  {
    name: 'Phát triển Mobile',
    description: 'Khóa học về phát triển ứng dụng di động',
    status: 'active'
  },
  {
    name: 'Digital Marketing',
    description: 'Khóa học về marketing số và quảng cáo trực tuyến',
    status: 'active'
  },
  {
    name: 'Kinh doanh',
    description: 'Khóa học về quản lý kinh doanh và khởi nghiệp',
    status: 'active'
  },
  {
    name: 'Kỹ năng mềm',
    description: 'Khóa học về kỹ năng giao tiếp và làm việc nhóm',
    status: 'active'
  },
  {
    name: 'Design & UI/UX',
    description: 'Khóa học về thiết kế giao diện và trải nghiệm người dùng',
    status: 'active'
  }
];

async function createCategories() {
  try {
    console.log('🚀 Bắt đầu tạo danh mục khóa học...');
    
    for (const categoryData of categories) {
      // Kiểm tra xem danh mục đã tồn tại chưa
      const existingCategory = await Category.findOne({ name: categoryData.name });
      
      if (existingCategory) {
        console.log(`⚠️  Danh mục "${categoryData.name}" đã tồn tại (ID: ${existingCategory._id})`);
        
        // Cập nhật trạng thái nếu cần
        if (existingCategory.status !== 'active') {
          existingCategory.status = 'active';
          await existingCategory.save();
          console.log(`✅ Đã cập nhật trạng thái thành active cho "${categoryData.name}"`);
        }
      } else {
        // Tạo danh mục mới
        const newCategory = new Category(categoryData);
        await newCategory.save();
        console.log(`✅ Đã tạo danh mục mới: "${categoryData.name}" (ID: ${newCategory._id})`);
      }
    }
    
    // Hiển thị tất cả danh mục active
    console.log('\n📋 Danh sách tất cả danh mục active:');
    const allActiveCategories = await Category.find({ status: 'active' }).sort({ name: 1 });
    
    allActiveCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (ID: ${category._id})`);
    });
    
    console.log(`\n✅ Hoàn thành! Tổng cộng ${allActiveCategories.length} danh mục active.`);
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo danh mục:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối MongoDB');
  }
}

// Chạy script
createCategories(); 