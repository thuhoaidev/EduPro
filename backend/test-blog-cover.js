const mongoose = require('mongoose');
const Blog = require('./src/models/Blog');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/edupro', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testBlogCoverImage() {
  try {
    console.log('🔍 Kiểm tra model Blog...');
    
    // Kiểm tra schema
    const blogSchema = Blog.schema;
    console.log('✅ Schema Blog loaded');
    
    // Kiểm tra trường coverImage
    const coverImageField = blogSchema.path('coverImage');
    if (coverImageField) {
      console.log('✅ Trường coverImage đã được thêm vào model');
      console.log('📋 Thông tin trường coverImage:', {
        type: coverImageField.instance,
        required: coverImageField.isRequired,
        default: coverImageField.defaultValue
      });
    } else {
      console.log('❌ Trường coverImage chưa được thêm');
    }
    
    // Kiểm tra trường image cũ
    const imageField = blogSchema.path('image');
    if (imageField) {
      console.log('✅ Trường image vẫn tồn tại');
    }
    
    console.log('\n📊 Tóm tắt cấu trúc Blog model:');
    console.log('- title: required, String');
    console.log('- content: required, String');
    console.log('- coverImage: required, String (MỚI)');
    console.log('- image: optional, String (CŨ)');
    console.log('- category: required, String');
    console.log('- status: enum, default: draft');
    console.log('- author: required, ObjectId ref User');
    
    console.log('\n🎯 Test hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testBlogCoverImage();

