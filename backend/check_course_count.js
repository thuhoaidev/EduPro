const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Course = require('./src/models/Course');
const Category = require('./src/models/Category');

const checkCourseCount = async () => {
    try {
        console.log('=== KIỂM TRA SỐ LƯỢNG KHÓA HỌC ===\n');
        
        // Tổng số khóa học
        const totalCourses = await Course.countDocuments();
        console.log(`Tổng số khóa học: ${totalCourses}`);
        
        // Khóa học theo displayStatus
        const publishedCourses = await Course.countDocuments({ displayStatus: 'published' });
        const hiddenCourses = await Course.countDocuments({ displayStatus: 'hidden' });
        console.log(`- Published: ${publishedCourses}`);
        console.log(`- Hidden: ${hiddenCourses}`);
        
        // Khóa học theo status
        const statusStats = await Course.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('\nTheo status:');
        statusStats.forEach(stat => {
            console.log(`- ${stat._id}: ${stat.count}`);
        });
        
        // Khóa học theo category
        console.log('\nTheo category:');
        const categoryStats = await Course.aggregate([
            {
                $match: { displayStatus: 'published' }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryInfo'
                }
            },
            {
                $group: {
                    _id: '$category',
                    categoryName: { $first: '$categoryInfo.name' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        categoryStats.forEach(stat => {
            const categoryName = stat.categoryName && stat.categoryName.length > 0 
                ? stat.categoryName[0] 
                : 'Unknown Category';
            console.log(`- ${categoryName}: ${stat.count} khóa học`);
        });
        
        // Danh sách tất cả categories
        console.log('\nDanh sách tất cả categories:');
        const allCategories = await Category.find({ status: 'active' });
        allCategories.forEach(cat => {
            console.log(`- ${cat.name} (ID: ${cat._id})`);
        });
        
        console.log('\n=== HOÀN TẤT ===');
        
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkCourseCount(); 