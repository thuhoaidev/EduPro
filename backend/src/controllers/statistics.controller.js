const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { validateSchema } = require('../utils/validateSchema');
const { getRevenueDataSchema, getTopCoursesSchema, getMonthlyStatisticsSchema } = require('../validations/statistics.validation');

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
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    // Đếm tổng đơn hàng
    const totalOrders = await Order.countDocuments({ status: 'completed' });
    
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
          status: 'completed',
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
      status: 'completed',
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
          status: 'completed',
          createdAt: { $lt: lastMonth }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const lastMonthOrders = await Order.countDocuments({
      status: 'completed',
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
          status: 'completed',
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

// Lấy top khóa học bán chạy
const getTopCourses = catchAsync(async (req, res) => {
  try {
    // Validate query parameters
    await validateSchema(getTopCoursesSchema, req.query);
    
    const { limit = 5 } = req.query;
    
    const topCourses = await Course.aggregate([
      {
        $match: { status: 'published' }
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
        $lookup: {
          from: 'users',
          localField: 'instructorId',
          foreignField: '_id',
          as: 'instructor'
        }
      },
      {
        $addFields: {
          sales: { $size: '$enrollments' },
          instructor: { $arrayElemAt: ['$instructor', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          title: 1,
          instructor: '$instructor.fullname',
          sales: 1,
          price: 1,
          rating: 1,
          thumbnail: 1,
          revenue: { $multiply: ['$price', { $size: '$enrollments' }] }
        }
      },
      { $sort: { sales: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    res.status(200).json({
      success: true,
      data: topCourses
    });
  } catch (error) {
    console.error('Error getting top courses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy top khóa học'
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
          status: 'completed',
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

module.exports = {
  getOverviewStatistics,
  getRevenueData,
  getTopCourses,
  getCategoryStatistics,
  getMonthlyStatistics
}; 