const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Order = require('../models/Order');
const TeacherWallet = require('../models/TeacherWallet');
const InstructorProfile = require('../models/InstructorProfile');
const catchAsync = require('../utils/catchAsync');

console.log('Instructor controller loaded');

// Lấy thống kê tổng quan cho instructor dashboard
exports.getInstructorDashboardStats = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Tìm instructor profile
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    // Lấy thống kê khóa học
    const courseStats = await Course.aggregate([
      {
        $match: {
          instructor: instructorProfile._id
        }
      },
      {
        $group: {
          _id: null,
          totalCourses: { $sum: 1 },
          totalStudents: { $sum: '$enrolledStudents' || 0 },
          publishedCourses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'approved'] }, 1, 0]
            }
          },
          pendingCourses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          },
          draftCourses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'draft'] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Lấy thống kê học viên
    const studentStats = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      },
      {
        $match: {
          'courseData.instructor': instructorProfile._id
        }
      },
      {
        $group: {
          _id: null,
          totalEnrollments: { $sum: 1 },
          uniqueStudents: { $addToSet: '$student' }
        }
      },
      {
        $project: {
          totalEnrollments: 1,
          uniqueStudents: { $size: '$uniqueStudents' }
        }
      }
    ]);

    // Lấy thống kê thu nhập
    const earningsStats = await TeacherWallet.aggregate([
      {
        $match: {
          teacherId: userId
        }
      },
      {
        $unwind: '$history'
      },
      {
        $match: {
          'history.type': 'earning'
        }
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$history.amount' },
          totalTransactions: { $sum: 1 }
        }
      }
    ]);

    // Lấy thống kê thu nhập theo tháng (6 tháng gần nhất)
    const monthlyEarnings = await TeacherWallet.aggregate([
      {
        $match: {
          teacherId: userId
        }
      },
      {
        $unwind: '$history'
      },
      {
        $match: {
          'history.type': 'earning',
          'history.createdAt': {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$history.createdAt' },
            month: { $month: '$history.createdAt' }
          },
          earnings: { $sum: '$history.amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Lấy top khóa học bán chạy
    const topCourses = await Course.aggregate([
      {
        $match: {
          instructor: instructorProfile._id,
          status: 'approved'
        }
      },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $addFields: {
          enrollmentCount: { $size: '$enrollments' }
        }
      },
      {
        $sort: { enrollmentCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $project: {
          _id: 1,
          title: 1,
          thumbnail: 1,
          price: 1,
          enrollmentCount: 1,
          rating: 1,
          totalReviews: 1
        }
      }
    ]);

    // Lấy thống kê học viên mới trong 30 ngày qua
    const recentEnrollments = await Enrollment.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      },
      {
        $match: {
          'courseData.instructor': instructorProfile._id,
          enrolledAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Tính toán dữ liệu
    const stats = courseStats[0] || {
      totalCourses: 0,
      totalStudents: 0,
      publishedCourses: 0,
      pendingCourses: 0,
      draftCourses: 0
    };

    const studentData = studentStats[0] || {
      totalEnrollments: 0,
      uniqueStudents: 0
    };

    const earningsData = earningsStats[0] || {
      totalEarnings: 0,
      totalTransactions: 0
    };

    // Lấy ví hiện tại
    const wallet = await TeacherWallet.findOne({ teacherId: userId });
    const currentBalance = wallet ? wallet.balance : 0;

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalCourses: stats.totalCourses,
          publishedCourses: stats.publishedCourses,
          pendingCourses: stats.pendingCourses,
          draftCourses: stats.draftCourses,
          totalStudents: studentData.uniqueStudents,
          totalEnrollments: studentData.totalEnrollments,
          totalEarnings: earningsData.totalEarnings,
          currentBalance: currentBalance,
          totalTransactions: earningsData.totalTransactions
        },
        monthlyEarnings: monthlyEarnings.map(item => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          earnings: item.earnings
        })),
        topCourses: topCourses,
        recentEnrollments: recentEnrollments.map(item => ({
          date: item._id,
          count: item.count
        }))
      }
    });
  } catch (error) {
    console.error('Error getting instructor dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard'
    });
  }
});

// Lấy thống kê chi tiết khóa học
exports.getCourseAnalytics = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    // Kiểm tra khóa học thuộc về giảng viên
    const course = await Course.findOne({
      _id: courseId,
      instructor: instructorProfile._id
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Lấy thống kê enrollment
    const enrollmentStats = await Enrollment.aggregate([
      {
        $match: {
          course: course._id
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Lấy thống kê completion
    const completionStats = await Enrollment.aggregate([
      {
        $match: {
          course: course._id,
          completed: true
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$enrolledAt'
            }
          },
          completedCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Tính tỷ lệ hoàn thành
    const totalEnrollments = await Enrollment.countDocuments({ course: course._id });
    const completedEnrollments = await Enrollment.countDocuments({ 
      course: course._id, 
      completed: true 
    });
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          thumbnail: course.thumbnail,
          price: course.price,
          status: course.status,
          rating: course.rating,
          totalReviews: course.totalReviews,
          enrolledStudents: course.enrolledStudents
        },
        analytics: {
          totalEnrollments,
          completedEnrollments,
          completionRate: Math.round(completionRate * 100) / 100,
          enrollmentTrend: enrollmentStats,
          completionTrend: completionStats
        }
      }
    });
  } catch (error) {
    console.error('Error getting course analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê khóa học'
    });
  }
});

// Lấy thống kê thu nhập chi tiết
exports.getEarningsAnalytics = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30' } = req.query; // Số ngày, mặc định 30
    
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Lấy thống kê thu nhập theo ngày
    const dailyEarnings = await TeacherWallet.aggregate([
      {
        $match: {
          teacherId: userId
        }
      },
      {
        $unwind: '$history'
      },
      {
        $match: {
          'history.type': 'earning',
          'history.createdAt': { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$history.createdAt'
            }
          },
          earnings: { $sum: '$history.amount' },
          transactions: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Lấy thống kê thu nhập theo khóa học
    const courseEarnings = await TeacherWallet.aggregate([
      {
        $match: {
          teacherId: userId
        }
      },
      {
        $unwind: '$history'
      },
      {
        $match: {
          'history.type': 'earning',
          'history.createdAt': { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: 'history.orderId',
          foreignField: '_id',
          as: 'orderData'
        }
      },
      {
        $unwind: '$orderData'
      },
      {
        $unwind: '$orderData.items'
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'orderData.items.courseId',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      {
        $unwind: '$courseData'
      },
      {
        $match: {
          'courseData.instructor': instructorProfile._id
        }
      },
      {
        $group: {
          _id: '$courseData._id',
          courseTitle: { $first: '$courseData.title' },
          courseThumbnail: { $first: '$courseData.thumbnail' },
          totalEarnings: { $sum: '$history.amount' },
          salesCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalEarnings: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Tính tổng thu nhập trong khoảng thời gian
    const totalEarnings = dailyEarnings.reduce((sum, day) => sum + day.earnings, 0);
    const totalTransactions = dailyEarnings.reduce((sum, day) => sum + day.transactions, 0);

    res.status(200).json({
      success: true,
      data: {
        period: parseInt(period),
        totalEarnings,
        totalTransactions,
        averageEarnings: totalTransactions > 0 ? Math.round(totalEarnings / totalTransactions) : 0,
        dailyEarnings: dailyEarnings.map(day => ({
          date: day._id,
          earnings: day.earnings,
          transactions: day.transactions
        })),
        topCourses: courseEarnings
      }
    });
  } catch (error) {
    console.error('Error getting earnings analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê thu nhập'
    });
  }
});

// Lấy danh sách học viên của instructor
exports.getInstructorStudents = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const courseId = req.query.courseId || '';
    
    // Tìm instructor profile
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    // Xây dựng query cho enrollment
    const enrollmentQuery = {};
    
    // Nếu có filter theo khóa học cụ thể
    if (courseId) {
      // Kiểm tra khóa học thuộc về instructor
      const course = await Course.findOne({
        _id: courseId,
        instructor: instructorProfile._id
      });
      
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học'
        });
      }
      
      enrollmentQuery.course = courseId;
    } else {
      // Lấy tất cả khóa học của instructor
      const instructorCourses = await Course.find({
        instructor: instructorProfile._id
      }).select('_id');
      
      const courseIds = instructorCourses.map(course => course._id);
      enrollmentQuery.course = { $in: courseIds };
    }

    // Lấy danh sách enrollment với thông tin học viên và khóa học
    const enrollments = await Enrollment.find(enrollmentQuery)
      .populate({
        path: 'student',
        select: 'fullname email avatar phone'
      })
      .populate({
        path: 'course',
        select: 'title thumbnail price'
      })
      .sort({ enrolledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Lọc theo tìm kiếm nếu có
    let filteredEnrollments = enrollments;
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filteredEnrollments = enrollments.filter(enrollment => 
        enrollment.student?.fullname?.match(searchRegex) ||
        enrollment.student?.email?.match(searchRegex) ||
        enrollment.course?.title?.match(searchRegex)
      );
    }

    // Tính tổng số enrollment
    const totalEnrollments = await Enrollment.countDocuments(enrollmentQuery);
    
    // Tính số học viên unique
    const uniqueStudents = await Enrollment.distinct('student', enrollmentQuery);

    // Tính progress cho từng enrollment
    const enrollmentsWithProgress = filteredEnrollments.map(enrollment => {
      // Tính progress dựa trên progress object
      let progress = 0;
      if (enrollment.progress && typeof enrollment.progress === 'object') {
        const progressEntries = Object.values(enrollment.progress);
        if (progressEntries.length > 0) {
          const completedLessons = progressEntries.filter((p) => p.completed).length;
          progress = Math.round((completedLessons / progressEntries.length) * 100);
        }
      }
      
      return {
        id: enrollment._id,
        student: {
          id: enrollment.student?._id,
          name: enrollment.student?.fullname || 'Unknown',
          email: enrollment.student?.email || '',
          avatar: enrollment.student?.avatar || '',
          phone: enrollment.student?.phone || ''
        },
        course: {
          id: enrollment.course?._id,
          title: enrollment.course?.title || 'Unknown Course',
          thumbnail: enrollment.course?.thumbnail || '',
          price: enrollment.course?.price || 0
        },
        progress: progress,
        completed: enrollment.completed || false,
        enrolledAt: enrollment.enrolledAt,
                 lastActivity: enrollment.progress ? 
           Object.values(enrollment.progress).reduce((latest, p) => {
             if (p.lastWatchedAt && (!latest || p.lastWatchedAt > latest)) {
               return p.lastWatchedAt;
             }
             return latest;
           }, null) : null
      };
    });

    res.status(200).json({
      success: true,
      data: {
        students: enrollmentsWithProgress,
        pagination: {
          total: totalEnrollments,
          page,
          limit,
          totalPages: Math.ceil(totalEnrollments / limit),
          uniqueStudents: uniqueStudents.length
        }
      }
    });
  } catch (error) {
    console.error('Error getting instructor students:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách học viên'
    });
  }
});

// Lấy danh sách khóa học của instructor
exports.getInstructorCourses = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Tìm instructor profile
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    // Lấy danh sách khóa học của instructor
    const courses = await Course.find({
      instructor: instructorProfile._id
    })
    .select('_id title thumbnail price status')
    .sort({ createdAt: -1 })
    .lean();

    res.status(200).json({
      success: true,
      data: courses.map(course => ({
        id: course._id,
        title: course.title,
        thumbnail: course.thumbnail,
        price: course.price,
        status: course.status
      }))
    });
  } catch (error) {
    console.error('Error getting instructor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách khóa học'
    });
  }
});

// Lấy chi tiết học viên
exports.getStudentDetail = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { studentId } = req.params;
    
    // Tìm instructor profile
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    // Tìm enrollment của học viên trong khóa học của instructor
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: { $in: await Course.find({ instructor: instructorProfile._id }).select('_id') }
    })
    .populate({
      path: 'student',
      select: 'fullname email avatar phone'
    })
    .populate({
      path: 'course',
      select: 'title thumbnail price'
    })
    .lean();

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học viên trong khóa học của bạn'
      });
    }

    // Tính progress dựa trên progress object
    let progress = 0;
    let lessonProgress = [];
    
    if (enrollment.progress && typeof enrollment.progress === 'object') {
      const progressEntries = Object.entries(enrollment.progress);
      if (progressEntries.length > 0) {
        const completedLessons = progressEntries.filter(([_, p]) => p.completed).length;
        progress = Math.round((completedLessons / progressEntries.length) * 100);
        
        // Tạo danh sách tiến độ bài học
        lessonProgress = progressEntries.map(([lessonId, p]) => ({
          lessonId,
          lessonTitle: `Bài học ${lessonId}`, // TODO: Lấy tên bài học từ database
          watchedSeconds: p.watchedSeconds || 0,
          videoDuration: p.videoDuration || 0,
          completed: p.completed || false,
          lastWatchedAt: p.lastWatchedAt || null,
          quizPassed: p.quizPassed || false
        }));
      }
    }

    // Tính lastActivity
    let lastActivity = null;
    if (enrollment.progress) {
      const activities = Object.values(enrollment.progress)
        .filter(p => p.lastWatchedAt)
        .map(p => p.lastWatchedAt);
      
      if (activities.length > 0) {
        lastActivity = new Date(Math.max(...activities.map(d => new Date(d))));
      }
    }

    res.status(200).json({
      success: true,
      data: {
        id: enrollment._id,
        student: {
          id: enrollment.student?._id,
          name: enrollment.student?.fullname || 'Unknown',
          email: enrollment.student?.email || '',
          avatar: enrollment.student?.avatar || '',
          phone: enrollment.student?.phone || ''
        },
        course: {
          id: enrollment.course?._id,
          title: enrollment.course?.title || 'Unknown Course',
          thumbnail: enrollment.course?.thumbnail || '',
          price: enrollment.course?.price || 0
        },
        progress: progress,
        completed: enrollment.completed || false,
        enrolledAt: enrollment.enrolledAt,
        lastActivity: lastActivity,
        lessonProgress: lessonProgress
      }
    });
  } catch (error) {
    console.error('Error getting student detail:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết học viên'
    });
  }
});

// Lấy dữ liệu analytics chi tiết
exports.getAnalytics = catchAsync(async (req, res) => {
  try {
    const userId = req.user._id;
    const { timeRange = '30d', startDate, endDate } = req.query;
    
    // Tìm instructor profile
    const instructorProfile = await InstructorProfile.findOne({ user: userId });
    if (!instructorProfile) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ giảng viên'
      });
    }

    // Tính toán khoảng thời gian
    let start, end;
    const now = new Date();
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (timeRange) {
        case '7d':
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      end = now;
    }

    // Lấy danh sách khóa học của instructor
    const instructorCourses = await Course.find({ instructor: instructorProfile._id }).select('_id');
    const courseIds = instructorCourses.map(c => c._id);

    // Thống kê tổng quan
    const [totalCourses, enrollmentsStats, earningsStats, ratingStats] = await Promise.all([
      Course.countDocuments({ instructor: instructorProfile._id }),
      Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: null, totalStudents: { $addToSet: '$student' }, totalEnrollments: { $sum: 1 } } },
        { $project: { totalStudents: { $size: '$totalStudents' }, totalEnrollments: 1 } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            'items.course': { $in: courseIds },
            status: 'completed',
            createdAt: { $gte: start, $lte: end }
          } 
        },
        { $group: { _id: null, totalEarnings: { $sum: '$totalAmount' } } }
      ]),
      Course.aggregate([
        { $match: { instructor: instructorProfile._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ])
    ]);

    const totalStudents = enrollmentsStats[0]?.totalStudents || 0;
    const totalEnrollments = enrollmentsStats[0]?.totalEnrollments || 0;
    const totalEarnings = earningsStats[0]?.totalEarnings || 0;
    const averageRating = ratingStats[0]?.avgRating || 0;

    // Thống kê theo tháng
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          'items.course': { $in: courseIds },
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          enrollments: { $sum: 1 },
          earnings: { $sum: '$totalAmount' },
          courses: { $addToSet: '$items.course' }
        }
      },
      {
        $project: {
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: { if: { $lt: ['$_id.month', 10] }, then: { $concat: ['0', { $toString: '$_id.month' }] }, else: { $toString: '$_id.month' } } }
            ]
          },
          enrollments: 1,
          earnings: 1,
          courses: { $size: '$courses' }
        }
      },
      { $sort: { month: 1 } }
    ]);

    // Hiệu suất khóa học
    const coursePerformance = await Course.aggregate([
      { $match: { instructor: instructorProfile._id } },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.course',
          pipeline: [{ $match: { status: 'completed' } }],
          as: 'orders'
        }
      },
      {
        $project: {
          courseId: '$_id',
          title: 1,
          enrollments: { $size: '$enrollments' },
          earnings: { $sum: '$orders.totalAmount' },
          rating: { $ifNull: ['$rating', 0] },
          completionRate: {
            $multiply: [
              {
                $divide: [
                  { $size: { $filter: { input: '$enrollments', cond: { $eq: ['$$this.completed', true] } } } },
                  { $size: '$enrollments' }
                ]
              },
              100
            ]
          }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 10 }
    ]);

    // Tương tác học viên
    const studentEngagement = await Enrollment.aggregate([
      {
        $match: {
          course: { $in: courseIds },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          activeStudents: { $addToSet: '$student' },
          newEnrollments: { $sum: 1 },
          completedLessons: {
            $sum: {
              $cond: [{ $eq: ['$completed', true] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          date: '$_id',
          activeStudents: { $size: '$activeStudents' },
          newEnrollments: 1,
          completedLessons: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Phân bổ thu nhập
    const earningsBreakdown = await Order.aggregate([
      {
        $match: {
          'items.course': { $in: courseIds },
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'items.course',
          foreignField: '_id',
          as: 'course'
        }
      },
      {
        $group: {
          _id: '$items.course',
          category: { $first: '$course.title' },
          amount: { $sum: '$items.price' }
        }
      },
      {
        $project: {
          category: 1,
          amount: 1,
          percentage: {
            $multiply: [
              { $divide: ['$amount', totalEarnings] },
              100
            ]
          }
        }
      },
      { $sort: { amount: -1 } },
      { $limit: 5 }
    ]);

    // Khóa học hiệu suất cao
    const topPerformingCourses = await Course.aggregate([
      { $match: { instructor: instructorProfile._id } },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments'
        }
      },
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'items.course',
          pipeline: [{ $match: { status: 'completed' } }],
          as: 'orders'
        }
      },
      {
        $project: {
          courseId: '$_id',
          title: 1,
          thumbnail: 1,
          enrollments: { $size: '$enrollments' },
          earnings: { $sum: '$orders.totalAmount' },
          rating: { $ifNull: ['$rating', 0] }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 10 }
    ]);

    const analyticsData = {
      overview: {
        totalCourses,
        totalStudents,
        totalEarnings,
        totalEnrollments,
        averageRating,
        completionRate: 0 // Có thể tính thêm
      },
      monthlyStats,
      coursePerformance,
      studentEngagement,
      earningsBreakdown,
      topPerformingCourses
    };

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu thống kê'
    });
  }
});
