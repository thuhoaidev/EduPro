const Course = require('../models/Course');
const Section = require('../models/Section');
const Lesson = require('../models/Lesson');
const ApiError = require('../utils/ApiError');

// Cập nhật trạng thái lesson và section khi admin duyệt khóa học
exports.approveCourseWithContent = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { action } = req.body; // 'approve' hoặc 'reject'

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra quyền admin
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('admin')) {
      throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
    }

    if (action === 'approve') {
      // Cập nhật trạng thái khóa học
      course.status = 'approved';
      course.displayStatus = 'published';
      await course.save();

      // Lấy tất cả section của khóa học
      const sections = await Section.find({ course_id: courseId });
      
      // Cập nhật trạng thái tất cả lesson và section từ 'draft' sang 'published'
      for (const section of sections) {
        // Cập nhật trạng thái section nếu đang ở 'draft'
        if (section.status === 'draft') {
          section.status = 'published';
          await section.save();
        }

        // Cập nhật trạng thái tất cả lesson trong section từ 'draft' sang 'published'
        await Lesson.updateMany(
          { section_id: section._id, status: 'draft' },
          { $set: { status: 'published' } }
        );
      }

      res.json({
        success: true,
        message: 'Khóa học đã được duyệt và tất cả nội dung mới đã được công khai',
        data: course
      });

    } else if (action === 'reject') {
      // Cập nhật trạng thái khóa học thành rejected
      course.status = 'rejected';
      course.displayStatus = 'hidden';
      await course.save();

      res.json({
        success: true,
        message: 'Khóa học đã bị từ chối',
        data: course
      });

    } else {
      throw new ApiError(400, 'Hành động không hợp lệ');
    }

  } catch (error) {
    next(error);
  }
};

// Lấy thông tin chi tiết về trạng thái lesson và section của khóa học
exports.getCourseContentStatus = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra quyền admin
    const userRoles = req.user.roles || [];
    if (!userRoles.includes('admin')) {
      throw new ApiError(403, 'Không có quyền thực hiện chức năng này');
    }

    // Lấy tất cả section của khóa học với thông tin lesson
    const sections = await Section.find({ course_id: courseId })
      .populate({
        path: 'lessons',
        select: 'title status position'
      });

    // Thống kê trạng thái
    const stats = {
      totalSections: sections.length,
      draftSections: sections.filter(s => s.status === 'draft').length,
      publishedSections: sections.filter(s => s.status === 'published').length,
      totalLessons: 0,
      draftLessons: 0,
      publishedLessons: 0
    };

    sections.forEach(section => {
      stats.totalLessons += section.lessons.length;
      section.lessons.forEach(lesson => {
        if (lesson.status === 'draft') {
          stats.draftLessons++;
        } else if (lesson.status === 'published') {
          stats.publishedLessons++;
        }
      });
    });

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          status: course.status,
          displayStatus: course.displayStatus
        },
        sections: sections.map(section => ({
          _id: section._id,
          title: section.title,
          status: section.status,
          lessons: section.lessons.map(lesson => ({
            _id: lesson._id,
            title: lesson.title,
            status: lesson.status,
            position: lesson.position
          }))
        })),
        stats
      }
    });

  } catch (error) {
    next(error);
  }
};
