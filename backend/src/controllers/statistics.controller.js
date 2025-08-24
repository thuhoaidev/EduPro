const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { validateSchema } = require('../utils/validateSchema');
const { getRevenueDataSchema, getMonthlyStatisticsSchema } = require('../validations/statistics.validation');

// Lấy thống kê tổng quan
const getOverviewStatistics = catchAsync(async (req, res) => {
  try {
    // Lấy ngày hôm nay và tháng trước
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    // Đếm tổng số user
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Đếm tổng số khóa học
    const totalCourses = await Course.countDocuments({ status: 'published' });
    
    // Tính tổng doanh thu
    const totalRevenue = await Order.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Đếm tổng đơn hàng
    const totalOrders = await Order.countDocuments({ status: 'paid' });
    
    // Học viên mới hôm nay
    const newUsersToday = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    // Khóa học mới hôm nay
    const newCoursesToday = await Course.countDocuments({
      status: 'published',
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    // Doanh thu hôm nay
    const revenueToday = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Đơn hàng hôm nay
    const ordersToday = await Order.countDocuments({
      status: 'paid',
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      }
    });
    
    // Tính tăng trưởng so với tháng trước
    const lastMonthUsers = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: { $lt: lastMonth }
    });
    
    const lastMonthCourses = await Course.countDocuments({
      status: 'published',
      createdAt: { $lt: lastMonth }
    });
    
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $lt: lastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const lastMonthOrders = await Order.countDocuments({
      status: 'paid',
      createdAt: { $lt: lastMonth }
    });
    
    // Tính phần trăm tăng trưởng
    const userGrowth = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 : 0;
    const courseGrowth = lastMonthCourses > 0 ? ((totalCourses - lastMonthCourses) / lastMonthCourses) * 100 : 0;
    const revenueGrowth = lastMonthRevenue[0]?.total > 0 ? 
      ((totalRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100 : 0;
    const orderGrowth = lastMonthOrders > 0 ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 : 0;
    
    const statistics = {
      totalUsers,
      totalCourses,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalOrders,
      newUsersToday,
      newCoursesToday,
      revenueToday: revenueToday[0]?.total || 0,
      ordersToday,
      userGrowth: Math.round(userGrowth * 10) / 10,
      courseGrowth: Math.round(courseGrowth * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10
    };
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting overview statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê tổng quan'
    });
  }
});

// Lấy dữ liệu doanh thu theo thời gian
const getRevenueData = catchAsync(async (req, res) => {
  try {
    // Validate query parameters
    await validateSchema(getRevenueDataSchema, req.query);
    
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Tạo dữ liệu cho tất cả các ngày trong khoảng
    const allDates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      allDates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Merge dữ liệu thực tế với tất cả các ngày
    const revenueMap = new Map(revenueData.map(item => [item._id, item]));
    const completeData = allDates.map(date => ({
      date,
      revenue: revenueMap.get(date)?.revenue || 0,
      orders: revenueMap.get(date)?.orders || 0
    }));
    
    res.status(200).json({
      success: true,
      data: completeData
    });
  } catch (error) {
    console.error('Error getting revenue data:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu doanh thu'
    });
  }
});



// Lấy thống kê theo danh mục
const getCategoryStatistics = catchAsync(async (req, res) => {
  try {
    const categoryStats = await Course.aggregate([
      {
        $match: { status: 'published' }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'courseId',
          as: 'enrollments'
        }
      },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: { $arrayElemAt: ['$category.name', 0] } },
          courseCount: { $sum: 1 },
          totalEnrollments: { $sum: { $size: '$enrollments' } },
          totalRevenue: { $sum: { $multiply: ['$price', { $size: '$enrollments' }] } }
        }
      },
      { $sort: { totalEnrollments: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    console.error('Error getting category statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê danh mục'
    });
  }
});

// Lấy thống kê theo tháng
const getMonthlyStatistics = catchAsync(async (req, res) => {
  try {
    // Validate query parameters
    await validateSchema(getMonthlyStatisticsSchema, req.query);
    
    const { year = new Date().getFullYear() } = req.query;
    
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Tạo dữ liệu cho tất cả 12 tháng
    const allMonths = Array.from({ length: 12 }, (_, i) => i + 1);
    const statsMap = new Map(monthlyStats.map(item => [item._id, item]));
    
    const completeData = allMonths.map(month => ({
      month,
      revenue: statsMap.get(month)?.revenue || 0,
      orders: statsMap.get(month)?.orders || 0
    }));
    
    res.status(200).json({
      success: true,
      data: completeData
    });
  } catch (error) {
    console.error('Error getting monthly statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê theo tháng'
    });
  }
});

// Lấy thống kê khóa học
const getCourseStatistics = catchAsync(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Tổng số khóa học
    const total = await Course.countDocuments();
    
    // Khóa học đã được phê duyệt (active)
    const active = await Course.countDocuments({ status: 'published' });
    
    // Khóa học chờ phê duyệt
    const pending = await Course.countDocuments({ status: 'pending' });
    
    // Khóa học tạo hôm nay
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayCount = await Course.countDocuments({
      createdAt: { $gte: today_start, $lt: today_end }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        pending,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Error getting course statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê khóa học'
    });
  }
});

// Lấy thống kê đơn hàng
const getOrderStatistics = catchAsync(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Tổng số đơn hàng
    const total = await Order.countDocuments();
    
    // Đơn hàng đã thanh toán
    const completed = await Order.countDocuments({ status: 'paid' });
    
    // Đơn hàng chờ thanh toán
    const pending = await Order.countDocuments({ status: 'pending' });
    
    // Đơn hàng tạo hôm nay
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayCount = await Order.countDocuments({
      createdAt: { $gte: today_start, $lt: today_end }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        completed,
        pending,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Error getting order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đơn hàng'
    });
  }
});

// Lấy thống kê học viên
const getStudentStatistics = catchAsync(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Tổng số học viên (không bao gồm admin và instructor)
    const total = await User.countDocuments({ role: 'student' });
    
    // Học viên có hoạt động gần đây (có enrollment trong 30 ngày qua)
    const recentEnrollments = await Enrollment.distinct('userId', {
      createdAt: { $gte: startDate }
    });
    const active = recentEnrollments.length;
    
    // Học viên mới đăng ký trong khoảng thời gian
    const newStudents = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: startDate }
    });
    
    // Học viên đăng ký hôm nay
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayCount = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: today_start, $lt: today_end }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        new: newStudents,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Error getting student statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê học viên'
    });
  }
});

// Lấy thống kê giảng viên
const getInstructorStatistics = catchAsync(async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Tổng số giảng viên
    const total = await User.countDocuments({ role: 'instructor' });
    
    // Giảng viên có khóa học đã được phê duyệt
    const activeInstructors = await Course.distinct('instructorId', {
      status: 'published'
    });
    const active = activeInstructors.length;
    
    // Giảng viên có khóa học chờ phê duyệt
    const pendingInstructors = await Course.distinct('instructorId', {
      status: 'pending'
    });
    const pending = pendingInstructors.length;
    
    // Giảng viên đăng ký hôm nay
    const today_start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const today_end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const todayCount = await User.countDocuments({
      role: 'instructor',
      createdAt: { $gte: today_start, $lt: today_end }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        pending,
        today: todayCount
      }
    });
  } catch (error) {
    console.error('Error getting instructor statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê giảng viên'
    });
  }
});

// Lấy thống kê công khai cho homepage
const getPublicStatistics = catchAsync(async (req, res) => {
  try {
    console.log('Getting public statistics...');
    
    // Đếm tổng số học viên (chỉ student, không bao gồm admin và instructor)
    const totalUsers = await User.countDocuments({ role: 'student' });
    console.log('Total students found:', totalUsers);
    
    // Đếm tổng số khóa học đã publish
    const totalCourses = await Course.countDocuments({ status: 'published' });
    console.log('Total published courses found:', totalCourses);
    
    // Đếm tổng số instructor đã được approve
    const totalInstructors = await User.countDocuments({ 
      role: 'instructor',
      isApproved: true 
    });
    console.log('Total approved instructors found:', totalInstructors);
    
    // Tính rating trung bình của tất cả khóa học đã publish
    const averageRating = await Course.aggregate([
      { 
        $match: { 
          status: 'published', 
          rating: { $exists: true, $ne: null, $gt: 0 } 
        } 
      },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    console.log('Average rating calculated:', averageRating[0]?.avgRating);
    
    // Đếm tổng số enrollment
    const totalEnrollments = await Enrollment.countDocuments();
    console.log('Total enrollments found:', totalEnrollments);
    
    // Nếu database trống, cung cấp dữ liệu thực tế
    const statistics = {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      totalInstructors: totalInstructors || 0,
      averageRating: averageRating[0]?.avgRating ? Math.round(averageRating[0].avgRating * 10) / 10 : 0,
      totalEnrollments: totalEnrollments || 0
    };
    
    console.log('Final statistics object:', statistics);
    
    res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error getting public statistics:', error);
    // Trả về dữ liệu rỗng nếu có lỗi
    res.status(200).json({
      success: true,
      data: {
        totalUsers: 0,
        totalCourses: 0,
        totalInstructors: 0,
        averageRating: 0,
        totalEnrollments: 0
      }
    });
  }
});

module.exports = {
  getOverviewStatistics,
  getRevenueData,
  getCourseStatistics,
  getOrderStatistics,
  getStudentStatistics,
  getInstructorStatistics,
  getCategoryStatistics,
  getMonthlyStatistics,
  getPublicStatistics
}; 