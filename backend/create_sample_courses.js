const mongoose = require('mongoose');
require('dotenv').config();

// Kết nối database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Course = require('./src/models/Course');
const Category = require('./src/models/Category');
const InstructorProfile = require('./src/models/InstructorProfile');

const createSampleCourses = async () => {
    try {
        console.log('=== TẠO KHÓA HỌC MẪU ===\n');
        
        // Lấy danh sách categories
        const categories = await Category.find({ status: 'active' });
        console.log(`Tìm thấy ${categories.length} categories`);
        
        if (categories.length === 0) {
            console.log('Không có categories nào. Vui lòng tạo categories trước.');
            return;
        }
        
        // Lấy instructor đầu tiên hoặc tạo mới
        let instructor = await InstructorProfile.findOne();
        if (!instructor) {
            console.log('Không có instructor nào. Vui lòng tạo instructor trước.');
            return;
        }
        
        // Tạo khóa học mẫu cho mỗi category
        const sampleCourses = [];
        
        categories.forEach((category, index) => {
            const courseCount = Math.floor(Math.random() * 5) + 1; // 1-5 khóa học mỗi category
            
            for (let i = 1; i <= courseCount; i++) {
                sampleCourses.push({
                    title: `Khóa học ${category.name} ${i}`,
                    slug: `khoa-hoc-${category.name.toLowerCase().replace(/\s+/g, '-')}-${i}`,
                    description: `Mô tả khóa học ${category.name} số ${i}`,
                    content: `Nội dung chi tiết của khóa học ${category.name} số ${i}`,
                    price: Math.floor(Math.random() * 500000) + 100000, // 100k - 600k
                    category: category._id,
                    instructor: instructor._id,
                    level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
                    language: 'Vietnamese',
                    requirements: ['Kiến thức cơ bản về máy tính'],
                    status: 'approved',
                    displayStatus: 'published',
                    views: Math.floor(Math.random() * 1000),
                    rating: Math.random() * 5,
                    totalReviews: Math.floor(Math.random() * 50)
                });
            }
        });
        
        // Xóa khóa học cũ (nếu có)
        await Course.deleteMany({ title: { $regex: /^Khóa học.*\d+$/ } });
        console.log('Đã xóa khóa học mẫu cũ');
        
        // Tạo khóa học mới
        const result = await Course.insertMany(sampleCourses);
        console.log(`Đã tạo ${result.length} khóa học mẫu`);
        
        // Hiển thị thống kê
        console.log('\nThống kê khóa học theo category:');
        const stats = await Course.aggregate([
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
        
        stats.forEach(stat => {
            const categoryName = stat.categoryName && stat.categoryName.length > 0 
                ? stat.categoryName[0] 
                : 'Unknown Category';
            console.log(`- ${categoryName}: ${stat.count} khóa học`);
        });
        
        console.log('\n=== HOÀN TẤT ===');
        
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.connection.close();
    }
};

createSampleCourses(); 