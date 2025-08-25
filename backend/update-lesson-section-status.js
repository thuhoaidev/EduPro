const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Lesson = require('./src/models/Lesson');
const Section = require('./src/models/Section');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupromax', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateLessonAndSectionStatus = async () => {
  try {
    console.log('🔄 Bắt đầu cập nhật trạng thái cho lesson và section...');

    // Cập nhật tất cả lesson hiện có thành 'published' (vì chúng đã tồn tại)
    const lessonResult = await Lesson.updateMany(
      { status: { $exists: false } }, // Chỉ cập nhật những lesson chưa có trường status
      { $set: { status: 'published' } }
    );
    console.log(`✅ Đã cập nhật ${lessonResult.modifiedCount} lesson thành trạng thái 'published'`);

    // Cập nhật tất cả section hiện có thành 'published' (vì chúng đã tồn tại)
    const sectionResult = await Section.updateMany(
      { status: { $exists: false } }, // Chỉ cập nhật những section chưa có trường status
      { $set: { status: 'published' } }
    );
    console.log(`✅ Đã cập nhật ${sectionResult.modifiedCount} section thành trạng thái 'published'`);

    // Kiểm tra kết quả
    const totalLessons = await Lesson.countDocuments();
    const lessonsWithStatus = await Lesson.countDocuments({ status: { $exists: true } });
    const totalSections = await Section.countDocuments();
    const sectionsWithStatus = await Section.countDocuments({ status: { $exists: true } });

    console.log('\n📊 Thống kê sau khi cập nhật:');
    console.log(`- Tổng số lesson: ${totalLessons}`);
    console.log(`- Lesson có trạng thái: ${lessonsWithStatus}`);
    console.log(`- Tổng số section: ${totalSections}`);
    console.log(`- Section có trạng thái: ${sectionsWithStatus}`);

    console.log('\n🎉 Hoàn thành cập nhật trạng thái!');

  } catch (error) {
    console.error('❌ Lỗi khi cập nhật trạng thái:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
};

// Chạy script
updateLessonAndSectionStatus();
