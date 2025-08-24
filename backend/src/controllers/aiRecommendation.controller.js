const UserBehavior = require('../models/UserBehavior');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

exports.getRecommendations = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  if (!userId) throw new ApiError(400, 'User ID là bắt buộc');
  
  let userBehavior = await UserBehavior.findOne({ userId });
  if (!userBehavior) {
    userBehavior = await UserBehavior.create({ userId });
  }
  
  // Lấy danh sách khóa học đang học (đã đăng ký)
  const enrolledCourses = await Enrollment.find({ student: userId })
    .populate('course', 'category level')
    .lean();
  
  // Lọc bỏ các enrollment có course null và lấy thông tin cần thiết
  const validEnrolledCourses = enrolledCourses.filter(e => e.course !== null);
  const enrolledCourseIds = validEnrolledCourses.map(e => e.course._id.toString());
  const enrolledCategories = [...new Set(validEnrolledCourses.map(e => e.course.category?.toString()).filter(Boolean))];
  const enrolledLevels = [...new Set(validEnrolledCourses.map(e => e.course.level).filter(Boolean))];
  
  // Lấy tất cả khóa học đã xuất bản
  const allCourses = await Course.find({ displayStatus: 'published' })
    .populate('instructor', 'fullname avatar')
    .populate('category', 'name')
    .lean();
  
  // Lọc bỏ khóa học đã đăng ký
  const availableCourses = allCourses.filter(course => 
    !enrolledCourseIds.includes(course._id.toString())
  );
  
  // Tính điểm cho từng khóa học
  const courseScores = {};
  availableCourses.forEach(course => {
    let score = 0;
    
    // Điểm cơ bản từ hành vi người dùng
    const viewed = userBehavior.viewedCourses.find(v => v.courseId && v.courseId.toString() === course._id.toString());
    if (viewed) {
      score += viewed.viewCount * 2 + Math.min(viewed.totalTimeSpent || 0, 300) / 30;
    }
    
    if (userBehavior.completedCourses.some(c => c.courseId && c.courseId.toString() === course._id.toString())) {
      score += 10;
    }
    
    const rated = userBehavior.ratedCourses.find(r => r.courseId && r.courseId.toString() === course._id.toString());
    if (rated && rated.rating >= 4) {
      score += 5;
    }
    
    if (userBehavior.commentedCourses.some(c => c.courseId && c.courseId.toString() === course._id.toString())) {
      score += 2;
    }
    
    if (userBehavior.bookmarkedCourses.some(c => c.courseId && c.courseId.toString() === course._id.toString())) {
      score += 2;
    }
    
    if (userBehavior.sharedCourses.some(c => c.courseId && c.courseId.toString() === course._id.toString())) {
      score += 1;
    }
    
    const purchased = userBehavior.purchasedCourses.find(p => p.courseId && p.courseId.toString() === course._id.toString());
    if (purchased) {
      score += 8 + Math.min((purchased.price || 0) / 100000, 5);
    }
    
    // Ưu tiên khóa học liên quan đến category đang học
    if (enrolledCategories.length > 0 && course.category && 
        enrolledCategories.includes(course.category._id.toString())) {
      score += 15; // Điểm cao cho cùng category
    }
    
    // Ưu tiên khóa học cùng level
    if (enrolledLevels.length > 0 && course.level && 
        enrolledLevels.includes(course.level)) {
      score += 10; // Điểm cho cùng level
    }
    
    // Ưu tiên khóa học nâng cao (level cao hơn)
    if (enrolledLevels.length > 0 && course.level) {
      const levelOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
      const userMaxLevel = Math.max(...enrolledLevels.map(l => levelOrder[l] || 0));
      const courseLevel = levelOrder[course.level] || 0;
      
      if (courseLevel > userMaxLevel) {
        score += 8; // Điểm cho khóa học nâng cao
      }
    }
    
    // Điểm cho khóa học mới (tạo trong 30 ngày qua)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (new Date(course.createdAt) > thirtyDaysAgo) {
      score += 3;
    }
    
    // Điểm cho khóa học có rating cao
    if (course.rating && course.rating >= 4.5) {
      score += 5;
    }
    
    // Điểm cho khóa học có nhiều học viên
    if (course.enrollmentCount && course.enrollmentCount > 100) {
      score += 3;
    }
    
    courseScores[course._id] = score;
  });
  
  // Sắp xếp theo điểm số
  const recommended = availableCourses
    .map(c => ({ 
      ...c, 
      recommendScore: courseScores[c._id] || 0 
    }))
    .sort((a, b) => b.recommendScore - a.recommendScore)
    .slice(0, 6);
  
  // Tạo lý do gợi Ý thông minh
  const reasons = [];
  
  // Lý do dựa trên khóa học đang học
  if (validEnrolledCourses.length > 0) {
    const categoryCounts = {};
    const levelCounts = {};
    
    validEnrolledCourses.forEach(enrollment => {
      const category = enrollment.course?.category?.name;
      const level = enrollment.course?.level;
      
      if (category) categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      if (level) levelCounts[level] = (levelCounts[level] || 0) + 1;
    });
    
    const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    const topLevel = Object.keys(levelCounts).sort((a, b) => levelCounts[b] - levelCounts[a])[0];
    
    if (topCategory) {
      reasons.push({
        id: 'category',
        title: `Dựa trên chủ đề bạn đang học`,
        description: `Bạn đang học ${categoryCounts[topCategory]} khóa học về ${topCategory}.`
      });
    }
    
    if (topLevel) {
      reasons.push({
        id: 'level',
        title: `Dựa trên cấp độ học tập`,
        description: `Bạn thường học các khóa học ${topLevel} level.`
      });
    }
  }
  
  // Lý do dựa trên hành vi
  if (userBehavior.viewedCourses.length > 0) {
    reasons.push({
      id: 'history',
      title: 'Dựa trên lịch sử học tập',
      description: `Bạn đã xem ${userBehavior.viewedCourses.length} khóa học trước đó.`
    });
  }
  
  if (userBehavior.completedCourses.length > 0) {
    reasons.push({
      id: 'completion',
      title: 'Dựa trên khóa học đã hoàn thành',
      description: `Bạn đã hoàn thành ${userBehavior.completedCourses.length} khóa học.`
    });
  }
  
  if (userBehavior.purchasedCourses.length > 0) {
    reasons.push({
      id: 'purchase',
      title: 'Dựa trên mua hàng',
      description: `Bạn đã mua ${userBehavior.purchasedCourses.length} khóa học.`
    });
  }
  
  if (userBehavior.ratedCourses.length > 0) {
    reasons.push({
      id: 'rating',
      title: 'Dựa trên đánh giá',
      description: `Bạn đã đánh giá ${userBehavior.ratedCourses.length} khóa học.`
    });
  }
  
  // Nếu không có lý do cụ thể, thêm lý do chung
  if (reasons.length === 0) {
    reasons.push({
      id: 'general',
      title: 'Gợi Ý phổ biến',
      description: 'Dựa trên các khóa học được yêu thích nhất.'
    });
  }
  
  res.json({ 
    success: true, 
    data: { 
      recommendations: recommended, 
      reasons 
    } 
  });
});

exports.updateUserBehavior = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { behaviorType, courseId, data } = req.body;
  
  if (!userId) {
    throw new ApiError(400, 'User ID là bắt buộc');
  }
  
  let userBehavior = await UserBehavior.findOne({ userId });
  if (!userBehavior) {
    userBehavior = await UserBehavior.create({ userId });
  }
  
  // Cập nhật hành vi dựa trên loại
  switch (behaviorType) {
    case 'view':
      const existingView = userBehavior.viewedCourses.find(v => v.courseId && v.courseId.toString() === courseId.toString());
      if (existingView) {
        existingView.viewCount += 1;
        existingView.lastViewed = new Date();
        existingView.totalTimeSpent += data?.timeSpent || 0;
      } else {
        userBehavior.viewedCourses.push({
          courseId,
          viewCount: 1,
          lastViewed: new Date(),
          totalTimeSpent: data?.timeSpent || 0
        });
      }
      break;
      
    case 'complete':
      if (!userBehavior.completedCourses.some(c => c.courseId && c.courseId.toString() === courseId.toString())) {
        userBehavior.completedCourses.push({
          courseId,
          completedAt: new Date()
        });
      }
      break;
      
    case 'rate':
      const existingRating = userBehavior.ratedCourses.find(r => r.courseId && r.courseId.toString() === courseId.toString());
      if (existingRating) {
        existingRating.rating = data.rating;
        existingRating.ratedAt = new Date();
      } else {
        userBehavior.ratedCourses.push({
          courseId,
          rating: data.rating,
          ratedAt: new Date()
        });
      }
      break;
      
    case 'bookmark':
      if (!userBehavior.bookmarkedCourses.some(c => c.courseId && c.courseId.toString() === courseId.toString())) {
        userBehavior.bookmarkedCourses.push({
          courseId,
          bookmarkedAt: new Date()
        });
      }
      break;
      
    case 'share':
      if (!userBehavior.sharedCourses.some(c => c.courseId && c.courseId.toString() === courseId.toString())) {
        userBehavior.sharedCourses.push({
          courseId,
          sharedAt: new Date()
        });
      }
      break;
      
    case 'purchase':
      if (!userBehavior.purchasedCourses.some(c => c.courseId && c.courseId.toString() === courseId.toString())) {
        userBehavior.purchasedCourses.push({
          courseId,
          price: data.price,
          purchasedAt: new Date()
        });
        userBehavior.totalSpent += data.price || 0;
      }
      break;
  }
  
  userBehavior.lastActivity = new Date();
  await userBehavior.save();
  
  res.json({ success: true });
});

exports.getUserBehaviorStats = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, 'User ID là bắt buộc');
  }

  const userBehavior = await UserBehavior.findOne({ userId })
    .populate('viewedCourses.courseId')
    .populate('completedCourses.courseId');

  if (!userBehavior) {
    return res.json({
      success: true,
      data: {
        totalCoursesViewed: 0,
        totalTimeSpent: 0,
        totalCoursesCompleted: 0,
        totalCoursesRated: 0,
        totalCoursesPurchased: 0,
        totalSpent: 0,
        recentActivity: []
      }
    });
  }

  // Tính toán thống kê
  const stats = {
    totalCoursesViewed: userBehavior.viewedCourses.length,
    totalTimeSpent: userBehavior.viewedCourses.reduce((sum, v) => sum + (v.totalTimeSpent || 0), 0),
    totalCoursesCompleted: userBehavior.completedCourses.length,
    totalCoursesRated: userBehavior.ratedCourses.length,
    totalCoursesPurchased: userBehavior.purchasedCourses.length,
    totalSpent: userBehavior.totalSpent,
    recentActivity: userBehavior.viewedCourses
      .filter(v => v.courseId) // Lọc bỏ các courseId null
      .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
      .slice(0, 10)
      .map(v => ({
        course: v.courseId,
        lastViewed: v.lastViewed,
        viewCount: v.viewCount
      }))
  };

  res.json({
    success: true,
    data: stats
  });
}); 