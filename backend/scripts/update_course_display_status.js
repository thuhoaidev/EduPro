const mongoose = require('mongoose');
const Course = require('../src/models/Course');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/edupro', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const updateCourseDisplayStatus = async () => {
    try {
        console.log('Bắt đầu cập nhật trạng thái displayStatus cho các khóa học...');
        
        // Cập nhật khóa học có status 'approved' thành displayStatus 'published'
        const approvedResult = await Course.updateMany(
            { status: 'approved' },
            { displayStatus: 'published' }
        );
        console.log(`Đã cập nhật ${approvedResult.modifiedCount} khóa học từ 'approved' thành 'published'`);
        
        // Cập nhật khóa học có status khác 'approved' thành displayStatus 'hidden'
        const hiddenResult = await Course.updateMany(
            { status: { $ne: 'approved' } },
            { displayStatus: 'hidden' }
        );
        console.log(`Đã cập nhật ${hiddenResult.modifiedCount} khóa học khác thành 'hidden'`);
        
        // Hiển thị thống kê
        const stats = await Course.aggregate([
            {
                $group: {
                    _id: '$displayStatus',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        console.log('\nThống kê trạng thái displayStatus:');
        stats.forEach(stat => {
            console.log(`${stat._id}: ${stat.count} khóa học`);
        });
        
        console.log('\nCập nhật hoàn tất!');
        
    } catch (error) {
        console.error('Lỗi khi cập nhật:', error);
    } finally {
        mongoose.connection.close();
    }
};

updateCourseDisplayStatus(); 