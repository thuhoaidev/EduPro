const Course = require('../models/Course');
const InstructorProfile = require('../models/InstructorProfile');
const {
  uploadBufferToCloudinary,
  getPublicIdFromUrl,
  deleteFromCloudinary,
  getVideoDuration,
} = require('../utils/cloudinary');
const { validateSchema } = require('../utils/validateSchema');
const { createCourseSchema, updateCourseSchema } = require('../validations/course.validation');
const ApiError = require('../utils/ApiError');
const Section = require('../models/Section');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { sendCourseApprovalResultEmail } = require('../utils/sendEmail');
const Notification = require('../models/Notification');
const Lesson = require('../models/Lesson');
const Video = require('../models/Video');

console.log('course.controller.js loaded at', new Date().toISOString());

// Gửi khóa học để duyệt
exports.submitCourseForApproval = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Kiểm tra quyền truy cập
    if (!req.user.roles.includes('instructor') && !req.user.roles.includes('admin')) {
      throw new ApiError(403, 'Bạn không có quyền thực hiện hành động này');
    }

    // Tìm khóa học
    const course = await Course.findById(id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
    if (!req.user.roles.includes('admin')) {
      const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
      if (!instructorProfile || course.instructor.toString() !== instructorProfile._id.toString()) {
        throw new ApiError(403, 'Bạn không có quyền thực hiện hành động này');
      }
    }

    // Kiểm tra trạng thái hiện tại
    if (course.status !== 'draft') {
      throw new ApiError(400, 'Chỉ có thể gửi khóa học ở trạng thái "Chưa Duyệt" để duyệt');
    }

    // Cập nhật trạng thái thành "Chờ Duyệt"
    course.status = 'pending';
    await course.save();

    res.json({
      success: true,
      message: 'Đã gửi khóa học để duyệt thành công',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

// Duyệt khóa học (cho admin/moderator)
exports.approveCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reason } = req.body; // action: 'approve' hoặc 'reject'

    // Kiểm tra quyền truy cập
    if (!req.user.roles.includes('admin') && !req.user.roles.includes('moderator')) {
      throw new ApiError(403, 'Bạn không có quyền thực hiện hành động này');
    }

    // Tìm khóa học
    const course = await Course.findById(id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra trạng thái hiện tại
    if (course.status !== 'pending') {
      throw new ApiError(400, 'Chỉ có thể duyệt khóa học ở trạng thái "Chờ Duyệt"');
    }

    if (action === 'approve') {
      // Duyệt khóa học
      course.status = 'approved';
      course.displayStatus = 'published'; // Tự động chuyển sang hiển thị
      await course.save();

      // Gửi notification khi admin duyệt khóa học
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Khóa học mới được duyệt',
          content: `Khóa học "${course.title}" đã được admin duyệt và phát hành!`,
          type: 'success',
          is_global: true,
          icon: 'check-circle',
          meta: { link: `/courses/${course._id}` },
        });
      } catch (notiErr) {
        console.error('Lỗi tạo notification duyệt khóa học:', notiErr);
      }

      res.json({
        success: true,
        message: 'Đã duyệt khóa học thành công',
        data: course,
      });
    } else if (action === 'reject') {
      // Từ chối khóa học
      if (!reason || reason.trim().length < 10) {
        throw new ApiError(400, 'Lý do từ chối phải có ít nhất 10 ký tự');
      }

      course.status = 'rejected';
      course.displayStatus = 'hidden'; // Đảm bảo ẩn khi bị từ chối
      course.rejection_reason = reason.trim(); // Lưu lý do từ chối
      await course.save();

      res.json({
        success: true,
        message: 'Đã từ chối khóa học',
        data: course,
      });
    } else {
      throw new ApiError(400, 'Hành động không hợp lệ');
    }
  } catch (error) {
    next(error);
  }
};

// Tạo khóa học mới
exports.createCourse = async (req, res, next) => {
  try {
    // Kiểm tra quyền truy cập
    if (!req.user.roles.includes('instructor') && !req.user.roles.includes('admin')) {
      throw new ApiError(403, 'Bạn không có quyền tạo khóa học');
    }

    // Nếu là admin, bỏ qua kiểm tra instructor profile
    if (req.user.roles.includes('admin')) {
      console.log('User is admin, skipping instructor profile check');
    } else {
      // Đã bỏ kiểm tra isInstructor và approvalStatus, chỉ cần role instructor
      // Tìm instructor profile
      console.log('Searching instructor profile with user:', req.user._id);
      let instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
      // Nếu không tìm thấy, thử tìm bằng email
      if (!instructorProfile) {
        console.log('Profile not found with user_id, trying email...');
        instructorProfile = await InstructorProfile.findOne({ email: req.user.email });
      }
      // Nếu vẫn không tìm thấy, tạo mới profile
      if (!instructorProfile) {
        console.log('Creating new profile for user...');
        // Kiểm tra và xóa record với user_id null nếu có
        const nullProfile = await InstructorProfile.findOne({ user: null });
        if (nullProfile) {
          await nullProfile.remove();
        }
        instructorProfile = new InstructorProfile({
          user: req.user._id,
          email: req.user.email,
          status: 'approved',
          is_approved: true,
          bio: req.user.bio,
          fullname: req.user.fullname,
          avatar: req.user.avatar,
        });
        try {
          await instructorProfile.save();
          console.log('Profile created successfully');
        } catch (saveError) {
          console.error('Error saving profile:', saveError);
          throw new ApiError(500, 'Lỗi khi tạo hồ sơ giảng viên', saveError);
        }
      }
      // Log kết quả tìm kiếm
      console.log('=== DEBUG PROFILE RESULT ===');
      if (instructorProfile) {
        console.log('Found instructor profile:', {
          id: instructorProfile._id,
          status: instructorProfile.status,
          is_approved: instructorProfile.is_approved,
        });
      } else {
        console.log('No instructor profile found');
      }
      // Kiểm tra trạng thái profile
      console.log('=== DEBUG PROFILE STATUS CHECK ===');
      console.log('Profile status:', instructorProfile.status);
      console.log('Profile is_approved:', instructorProfile.is_approved);
      if (!instructorProfile) {
        console.log('Profile not found after all attempts');
        throw new ApiError(
          403,
          'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.',
        );
      }
      // Nếu profile có status pending hoặc is_approved=false, cập nhật lại
      if (instructorProfile.status !== 'approved' || !instructorProfile.is_approved) {
        console.log('Updating profile status to match user status');
        instructorProfile.status = 'approved';
        instructorProfile.is_approved = true;
        await instructorProfile.save();
      }
      // Lưu instructor profile vào request để sử dụng sau
      req.instructorProfile = instructorProfile;
      console.log('Instructor profile saved to request');
    }

    // Xóa các trường không mong muốn khỏi body trước khi xử lý
    delete req.body.avatar;

    // Kiểm tra và xử lý thumbnail
    let thumbnailUrl = null;
    if (req.files && req.files.avatar && req.files.avatar[0]) {
      console.log('Đang upload thumbnail...');
      try {
        const uploadResult = await uploadBufferToCloudinary(req.files.avatar[0].buffer, 'courses');
        thumbnailUrl = uploadResult.secure_url;
        console.log('Upload thành công:', thumbnailUrl);
      } catch (uploadError) {
        console.error('Lỗi upload thumbnail:', uploadError);
        throw new ApiError(500, 'Lỗi khi upload ảnh đại diện', uploadError);
      }
    } else {
      console.log('Không có file thumbnail hoặc file không hợp lệ');
      // Sử dụng ảnh mặc định nếu không có thumbnail
      thumbnailUrl = 'https://via.placeholder.com/600x400/4A90E2/FFFFFF?text=Khóa+học'; // URL placeholder hợp lệ
    }

    // Log thông tin về dữ liệu gửi lên
    console.log('=== DEBUG REQUEST DATA ===');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    console.log('Thumbnail URL:', thumbnailUrl);
    console.log('Instructor Profile ID:', req.instructorProfile._id);

    // Chuẩn bị dữ liệu khóa học
    const courseData = {
      ...req.body,
      instructor: req.instructorProfile._id.toString(), // validate cần string
      thumbnail: thumbnailUrl,
      price: Number(req.body.price),
      discount_amount: Number(req.body.discount_amount || 0),
      discount_percentage: Number(req.body.discount_percentage || 0),
      requirements: Array.isArray(req.body.requirements)
        ? req.body.requirements
        : typeof req.body.requirements === 'string' && req.body.requirements.trim()
        ? [req.body.requirements.trim()]
        : [],
      category: req.body.category,
    };

    // Kiểm tra giảm giá không vượt quá giá gốc
    if (courseData.discount_amount && courseData.discount_amount > courseData.price) {
      throw new ApiError(400, 'Số tiền giảm giá không được lớn hơn giá gốc');
    }
    if (courseData.discount_percentage && courseData.discount_percentage > 100) {
      throw new ApiError(400, 'Phần trăm giảm giá không được lớn hơn 100%');
    }

    // Kiểm tra độ dài mô tả
    if (courseData.description && courseData.description.length < 10) {
      throw new ApiError(400, 'Mô tả phải có ít nhất 10 ký tự');
    }

    // Log dữ liệu trước khi validate
    console.log('=== DEBUG COURSE DATA ===');
    console.log('Course Data:', JSON.stringify(courseData, null, 2));

    // Validate dữ liệu
    try {
      const validatedData = await validateSchema(createCourseSchema, courseData);
      // Sau validate, chuyển instructor về ObjectId nếu cần
      validatedData.instructor = req.instructorProfile._id;

      // Log dữ liệu sau validate
      console.log('=== DEBUG VALIDATED DATA ===');
      console.log('Validated Data:', JSON.stringify(validatedData, null, 2));

      // Tạo và lưu khóa học
      try {
        const course = new Course(validatedData);
        await course.save();

        // Tạo sections, lessons, videos và quiz nếu có
        console.log('=== DEBUG SECTIONS DATA ===');
        console.log('Sections from request:', JSON.stringify(req.body.sections, null, 2));
        console.log('Sections type:', typeof req.body.sections);
        console.log('Is Array:', Array.isArray(req.body.sections));

        // Xử lý sections có thể là string hoặc array
        let sectionsData = req.body.sections;
        if (typeof sectionsData === 'string') {
          try {
            sectionsData = JSON.parse(sectionsData);
            console.log('Parsed sections data:', JSON.stringify(sectionsData, null, 2));
          } catch (parseError) {
            console.error('Lỗi parse JSON sections:', parseError);
            throw new ApiError(400, 'Dữ liệu sections không hợp lệ');
          }
        }

        // Nếu sectionsData là object (một section), chuyển thành array
        if (sectionsData && !Array.isArray(sectionsData)) {
          sectionsData = [sectionsData];
          console.log('Converted single section to array:', JSON.stringify(sectionsData, null, 2));
        }

        if (sectionsData && Array.isArray(sectionsData)) {
          const sectionsToCreate = sectionsData.map((sectionData, idx) => {
            return {
              course_id: course._id,
              title: sectionData.title,
              position: idx,
            };
          });

          if (sectionsToCreate.length > 0) {
            const createdSections = await Section.insertMany(sectionsToCreate);
            console.log(`Đã tạo ${createdSections.length} chương cho khóa học`);
            console.log('Created sections:', JSON.stringify(createdSections, null, 2));

            // Tạo lessons, videos và quiz cho từng section
            for (let i = 0; i < createdSections.length; i++) {
              const section = createdSections[i];
              const sectionData = sectionsData[i];

              console.log(`Section ${i + 1} data:`, JSON.stringify(sectionData, null, 2));

              if (sectionData.lessons && Array.isArray(sectionData.lessons)) {
                console.log(
                  `Creating ${sectionData.lessons.length} lessons for section ${section.title}`,
                );

                const lessonsToCreate = sectionData.lessons.map((lessonData, lessonIdx) => ({
                  section_id: section._id,
                  title: lessonData.title || `Bài học ${lessonIdx + 1}`,
                  position: lessonIdx,
                  is_preview: lessonData.is_preview || false,
                }));

                if (lessonsToCreate.length > 0) {
                  const createdLessons = await Lesson.insertMany(lessonsToCreate);
                  console.log(
                    `Đã tạo ${createdLessons.length} bài học cho chương ${section.title}`,
                  );
                  console.log('Created lessons:', JSON.stringify(createdLessons, null, 2));

                  // Cập nhật section với lessons
                  section.lessons = createdLessons.map(lesson => lesson._id);
                  await section.save();
                  console.log('Updated section with lessons:', JSON.stringify(section, null, 2));

                  // Tạo videos và quiz cho từng lesson
                  for (let j = 0; j < createdLessons.length; j++) {
                    const lesson = createdLessons[j];
                    const lessonData = sectionData.lessons[j];

                    // Tạo video nếu có
                    if (lessonData.video && req.files && req.files.video_files) {
                      try {
                        console.log(
                          'Available video files:',
                          req.files.video_files.map(f => f.originalname),
                        );
                        // Tìm video file tương ứng với lesson này
                        const videoFileName = `video_${i}_${j}_`;
                        const videoFile = req.files.video_files.find(file =>
                          file.originalname.startsWith(videoFileName),
                        );

                        if (videoFile) {
                          // Upload video file với option lấy duration
                          const videoUploadResult = await uploadBufferToCloudinary(
                            videoFile.buffer,
                            'videos',
                            {
                              resource_type: 'video',
                              eager: [{ format: 'mp4', quality: 'auto' }],
                              eager_async: true,
                              eager_notification_url: null,
                            },
                          );

                          // Tính thời lượng video từ buffer
                          console.log(
                            'Video upload result:',
                            JSON.stringify(videoUploadResult, null, 2),
                          );

                          let videoDuration = 0;
                          try {
                            // Thử lấy duration từ Cloudinary trước
                            if (videoUploadResult.duration) {
                              videoDuration = Math.round(videoUploadResult.duration);
                            } else {
                              // Nếu không có, tính từ buffer
                              videoDuration = await getVideoDuration(videoFile.buffer);
                            }
                          } catch (durationError) {
                            console.error('Error getting video duration:', durationError);
                            // Fallback: sử dụng duration từ frontend hoặc ước tính
                            videoDuration = lessonData.video.duration || 0;
                          }

                          console.log(`Video duration for lesson ${lesson.title}:`, videoDuration);

                          const video = new Video({
                            lesson_id: lesson._id,
                            duration: videoDuration,
                            quality_urls: new Map([
                              [
                                'high',
                                {
                                  url: videoUploadResult.secure_url,
                                  public_id: videoUploadResult.public_id,
                                },
                              ],
                            ]),
                          });

                          await video.save();
                          console.log(`Đã tạo video cho bài học: ${lesson.title}`);
                        } else {
                          console.log(`Không tìm thấy video file cho bài học: ${lesson.title}`);
                        }
                      } catch (videoError) {
                        console.error('Lỗi khi tạo video:', videoError);
                        // Không throw error để không ảnh hưởng đến việc tạo lesson
                      }
                    }

                    // Tạo quiz nếu có
                    console.log(
                      `Lesson ${j + 1} quiz data:`,
                      JSON.stringify(lessonData.quiz, null, 2),
                    );
                    if (
                      lessonData.quiz &&
                      lessonData.quiz.questions &&
                      lessonData.quiz.questions.length > 0
                    ) {
                      try {
                        const Quiz = require('../models/Quiz');
                        const quiz = new Quiz({
                          lesson_id: lesson._id,
                          questions: lessonData.quiz.questions,
                        });

                        await quiz.save();
                        console.log(`Đã tạo quiz cho bài học: ${lesson.title}`);
                      } catch (quizError) {
                        console.error('Lỗi khi tạo quiz:', quizError);
                        // Không throw error để không ảnh hưởng đến việc tạo lesson
                      }
                    }
                  }
                }
              }
            }
          }
        }
        // Gửi thông báo global khi có khóa học mới
        /*
                const notification = await Notification.create({
                  title: 'Khóa học mới',
                  content: `Khóa học ${course.title} đã được phát hành!`,
                  type: 'success',
                  is_global: true,
                  icon: 'check-circle',
                  meta: { link: `/courses/${course._id}` }
                });
                const io = req.app.get && req.app.get('io');
                if (io) {
                  io.emit('new-notification', notification); // emit global
                }
*/
        // Trả về kết quả
        res.status(201).json({
          success: true,
          data: course,
        });
      } catch (error) {
        console.error('Lỗi khi tạo khóa học:', error);
        if (error.name === 'ValidationError') {
          console.error('Validation errors:', error.errors);
          throw new ApiError(400, 'Dữ liệu không hợp lệ', error.errors);
        }
        // Xử lý lỗi duplicate key cho slug
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
          throw new ApiError(400, 'Tên khóa học đã tồn tại. Vui lòng chọn tên khác.');
        }
        throw new ApiError(500, 'Lỗi khi tạo khóa học', error);
      }
    } catch (validationError) {
      console.error('Lỗi validate dữ liệu:', validationError);
      throw new ApiError(400, 'Dữ liệu không hợp lệ', validationError);
    }
  } catch (error) {
    console.error('Lỗi tổng quát:', error);
    console.error('Error stack:', error.stack);
    next(error);
  }
};

// Cập nhật khóa học
exports.updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lấy course hiện tại để xử lý ảnh cũ
    const oldCourse = await Course.findById(id)
      .populate('instructor', 'userId bio expertise rating')
      .populate('category', 'name');

    if (!oldCourse) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra quyền chỉnh sửa
    let instructorProfile;
    try {
      // Bỏ qua instructor từ body request
      delete req.body.instructor;

      console.log('\n=== DEBUG INSTRUCTOR PROFILE ===');
      console.log('User ID từ token:', req.user.id);

      instructorProfile = await InstructorProfile.findOne({ user: req.user._id });

      if (!instructorProfile) {
        console.log('Không tìm thấy hồ sơ giảng viên nào cho user này');
        throw new ApiError(
          403,
          'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.',
        );
      }

      console.log('Tìm thấy hồ sơ giảng viên:', {
        id: instructorProfile._id,
        userId: instructorProfile.userId,
        status: instructorProfile.status,
        bio: instructorProfile.bio,
        expertise: instructorProfile.expertise,
      });

      if (instructorProfile.status !== 'approved') {
        console.log(
          'Hồ sơ giảng viên chưa được duyệt. Trạng thái hiện tại:',
          instructorProfile.status,
        );
        throw new ApiError(
          403,
          `Hồ sơ giảng viên của bạn đang ở trạng thái "${instructorProfile.status}". Vui lòng đợi được phê duyệt.`,
        );
      }

      // Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
      // [DEV ONLY] Bỏ kiểm tra chủ sở hữu khóa học để instructor có thể cập nhật mọi khóa học
      // if (oldCourse.instructor._id.toString() !== instructorProfile._id.toString()) {
      //     throw new ApiError(403, 'Bạn không có quyền chỉnh sửa khóa học này');
      // }

      console.log('=== END DEBUG ===\n');
    } catch (instructorError) {
      console.error('\n=== LỖI CHI TIẾT ===');
      console.error('Error name:', instructorError.name);
      console.error('Error message:', instructorError.message);
      console.error('Error stack:', instructorError.stack);
      console.error('=== END LỖI ===\n');

      if (instructorError instanceof ApiError) {
        throw instructorError;
      }
      throw new ApiError(500, 'Lỗi khi xác thực thông tin giảng viên: ' + instructorError.message);
    }

    // Xử lý thumbnail
    let thumbnailUrl = oldCourse.thumbnail;
    if (req.file && req.file.buffer) {
      try {
        // Xóa ảnh cũ trên Cloudinary nếu có
        if (oldCourse.thumbnail && oldCourse.thumbnail.includes('res.cloudinary.com')) {
          const publicId = getPublicIdFromUrl(oldCourse.thumbnail);
          if (publicId) {
            await deleteFromCloudinary(publicId);
          }
        }

        // Upload ảnh mới
        const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'courses');
        thumbnailUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Lỗi upload thumbnail:', uploadError);
        throw new ApiError(500, 'Lỗi khi tải lên ảnh đại diện: ' + uploadError.message);
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      ...req.body,
      instructor: instructorProfile._id.toString(), // Thêm instructor từ profile
      thumbnail: thumbnailUrl,
      price: typeof req.body.price !== 'undefined' ? Number(req.body.price) : undefined,
      discount_amount:
        typeof req.body.discount_amount !== 'undefined'
          ? Number(req.body.discount_amount)
          : undefined,
      discount_percentage:
        typeof req.body.discount_percentage !== 'undefined'
          ? Number(req.body.discount_percentage)
          : undefined,
      requirements: req.body.requirements
        ? Array.isArray(req.body.requirements)
          ? req.body.requirements
          : Object.keys(req.body)
              .filter(key => key.startsWith('requirements['))
              .map(key => req.body[key])
        : undefined,
    };

    // Log dữ liệu trước khi validate
    console.log('\n=== COURSE UPDATE DATA BEFORE VALIDATION ===');
    console.log(JSON.stringify(updateData, null, 2));
    console.log('=== END COURSE UPDATE DATA ===\n');

    // Validate dữ liệu
    const validatedData = await validateSchema(updateCourseSchema, updateData);

    // Chuyển instructor string trở lại thành ObjectId
    validatedData.instructor = instructorProfile._id;

    // Log dữ liệu sau khi validate
    console.log('\n=== VALIDATED UPDATE DATA ===');
    console.log(JSON.stringify(validatedData, null, 2));
    console.log('=== END VALIDATED DATA ===\n');

    // Cập nhật khóa học
    const course = await Course.findByIdAndUpdate(
      id,
      { $set: validatedData },
      {
        new: true,
        runValidators: true,
        populate: [
          { path: 'instructor', select: 'userId bio expertise rating' },
          { path: 'category', select: 'name' },
        ],
      },
    );

    // Log dữ liệu sau khi update
    console.log('\n=== COURSE DATA AFTER UPDATE ===');
    console.log(JSON.stringify(course, null, 2));
    console.log('=== END COURSE DATA AFTER UPDATE ===\n');

    // Xử lý cập nhật sections nếu có
    if (req.body.sections && Array.isArray(req.body.sections)) {
      // Xóa toàn bộ section cũ
      await Section.deleteMany({ course_id: id });
      // Tạo lại section mới
      const sectionsToCreate = req.body.sections.map((sectionData, idx) => {
        // Parse JSON string nếu cần
        let section;
        if (typeof sectionData === 'string') {
          try {
            section = JSON.parse(sectionData);
          } catch (parseError) {
            console.error('Lỗi parse JSON section:', parseError);
            throw new ApiError(400, 'Dữ liệu section không hợp lệ');
          }
        } else {
          section = sectionData;
        }

        return {
          course_id: id,
          title: section.title,
          position: idx,
        };
      });
      if (sectionsToCreate.length > 0) {
        await Section.insertMany(sectionsToCreate);
      }
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('\n=== LỖI CẬP NHẬT KHÓA HỌC ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('Error stack:', error.stack);
    console.error('=== END LỖI ===\n');
    next(error);
  }
};

// Xóa khóa học
exports.deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Lấy khóa học hiện tại
    console.log('=== DEBUG DELETE COURSE ===');
    console.log('Course ID:', id);
    console.log('User ID:', req.user._id);
    console.log('User roles:', req.user.roles);

    const course = await Course.findById(id)
      .populate('instructor', 'user status is_approved')
      .populate('category', 'name');

    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Kiểm tra quyền xóa
    let instructorProfile;
    try {
      // Bỏ qua instructor từ body request
      delete req.body.instructor;

      console.log('\n=== DEBUG INSTRUCTOR PROFILE ===');
      console.log('User ID từ token:', req.user._id);

      instructorProfile = await InstructorProfile.findOne({ user: req.user._id });

      if (!instructorProfile) {
        console.log('Không tìm thấy hồ sơ giảng viên nào cho user này');
        throw new ApiError(
          403,
          'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.',
        );
      }

      console.log('Tìm thấy hồ sơ giảng viên:', {
        id: instructorProfile._id,
        userId: instructorProfile.userId,
        status: instructorProfile.status,
        is_approved: instructorProfile.is_approved,
        bio: instructorProfile.bio,
        expertise: instructorProfile.expertise,
      });

      if (instructorProfile.status !== 'approved' || !instructorProfile.is_approved) {
        console.log(
          'Hồ sơ giảng viên chưa được duyệt. Trạng thái hiện tại:',
          instructorProfile.status,
        );
        throw new ApiError(
          403,
          `Hồ sơ giảng viên của bạn đang ở trạng thái "${instructorProfile.status}". Vui lòng đợi được phê duyệt.`,
        );
      }

      // Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
      // [DEV ONLY] Bỏ kiểm tra chủ sở hữu khóa học để instructor có thể cập nhật mọi khóa học
      // if (course.instructor._id.toString() !== instructorProfile._id.toString()) {
      //     throw new ApiError(403, 'Bạn không có quyền xóa khóa học này');
      // }

      console.log('=== END DEBUG ===\n');
    } catch (instructorError) {
      console.error('\n=== LỖI CHI TIẾT ===');
      console.error('Error name:', instructorError.name);
      console.error('Error message:', instructorError.message);
      console.error('Error stack:', instructorError.stack);
      console.error('=== END LỖI ===\n');

      if (instructorError instanceof ApiError) {
        throw instructorError;
      }
      throw new ApiError(500, 'Lỗi khi xác thực thông tin giảng viên: ' + instructorError.message);
    }

    // Xóa ảnh từ Cloudinary nếu có
    if (course.thumbnail && course.thumbnail.includes('res.cloudinary.com')) {
      console.log('Deleting thumbnail from Cloudinary...');
      try {
        const publicId = getPublicIdFromUrl(course.thumbnail);
        if (publicId) {
          await deleteFromCloudinary(publicId);
          console.log('Thumbnail deleted successfully');
        }
      } catch (cloudinaryError) {
        console.error('Error deleting thumbnail:', cloudinaryError);
        // Không throw lỗi vì việc xóa thumbnail không quan trọng
      }
    }

    // Xóa khóa học
    try {
      await Course.findByIdAndDelete(id);
      console.log('Course deleted successfully');
    } catch (deleteError) {
      console.error('Error deleting course:', deleteError);
      throw new ApiError(500, 'Lỗi khi xóa khóa học', deleteError);
    }

    // Trả về kết quả
    res.json({
      success: true,
      message: 'Xóa khóa học thành công',
      data: {
        id: course._id,
        title: course.title,
        instructor: {
          id: course.instructor._id,
          name: course.instructor.user.fullname,
          status: course.instructor.status,
          is_approved: course.instructor.is_approved,
        },
        category: {
          id: course.category._id,
          name: course.category.name,
        },
      },
    });
  } catch (error) {
    console.error('\n=== LỖI XÓA KHÓA HỌC ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    console.error('Error stack:', error.stack);
    console.error('=== END LỖI ===\n');
    next(error);
  }
}; // Đóng ngoặc hàm deleteCourse

// Cập nhật trạng thái khóa học
exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, displayStatus } = req.body;

    // Lấy user và course
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'Người dùng không tồn tại');
    }
    // Populate instructor profile và user để lấy email
    const course = await Course.findById(id).populate({
      path: 'instructor',
      populate: { path: 'user', select: 'email fullname' },
    });
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Cho phép bất kỳ user nào cập nhật trạng thái khóa học
    if (typeof status === 'string' && status !== course.status) {
      course.status = status;
      await course.save();
      return res.json({ success: true, data: course });
    }
    if (displayStatus && displayStatus !== course.displayStatus) {
      course.displayStatus = displayStatus;
      await course.save();
      return res.json({ success: true, data: course });
    }
    throw new ApiError(403, 'Bạn không có quyền cập nhật trạng thái khóa học');
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách khóa học

exports.getCourses = async (req, res, next) => {
  try {
    // Bỏ kiểm tra đăng nhập và quyền, cho phép public truy cập
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      status,
      category,
      level,
      search,
      minPrice,
      maxPrice,
      instructor,
      includeDraft,
    } = req.query;

    // Xây dựng query
    const query = {};

    // Xử lý filter theo instructor
    if (instructor === 'true' && req.user) {
      // Tìm instructor profile của user hiện tại
      const InstructorProfile = require('../models/InstructorProfile');
      const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });
      if (instructorProfile) {
        query.instructor = instructorProfile._id;
      }
    }

    if (status) {
      // Hỗ trợ multiple status values được phân tách bằng dấu phẩy
      if (typeof status === 'string' && status.includes(',')) {
        query.status = { $in: status.split(',').map(s => s.trim()) };
      } else {
        query.status = status;
      }
    } else if (instructor === 'true' && includeDraft === 'true') {
      // Nếu lấy khóa học của instructor và bao gồm draft, lấy tất cả trạng thái
      query.status = { $in: ['draft', 'pending', 'approved', 'rejected'] };
    } else {
      // Mặc định chỉ lấy khóa học có trạng thái published
      query.displayStatus = 'published';
    }
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Thực hiện query với phân trang
    const courses = await Course.find(query)
      .populate('instructor', 'userId bio expertise rating')
      .populate('category', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Đếm tổng số khóa học
    const total = await Course.countDocuments(query);

    const formattedCourses = await Promise.all(
      courses.map(async course => {
        // Lấy tất cả section thuộc khóa học
        const sections = await Section.find({ course_id: course._id }).select('lessons');
        console.log(`Course: ${course.title} - Sections found: ${sections.length}`);
        // Tính tổng số bài học từ tất cả section
        const totalLessons = sections.reduce((sum, section) => {
          return sum + (section.lessons?.length || 0);
        }, 0);

        const obj = course.toObject();
        obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
        obj.discount = obj.discount || 0;
        obj.instructor = course.instructor
          ? {
              bio: course.instructor.bio,
              expertise: course.instructor.expertise,
              user: course.instructor.user,
            }
          : null;
        obj.totalLessons = totalLessons; // 👈 Thêm tổng số bài học
        return obj;
      }),
    );

    res.json({
      success: true,
      data: formattedCourses,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}; // Đóng ngoặc hàm getCourses

// Lấy khóa học theo slug
exports.getCourseBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      slug,
      displayStatus: 'published', // Chỉ hiển thị khóa học có trạng thái published
    })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
          select: 'fullname avatar',
        },
      })
      .populate('category', 'name');

    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Tăng lượt xem
    course.views = (course.views || 0) + 1;
    await course.save();

    const formatCourse = course => {
      const obj = course.toObject();
      obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
      obj.discount = obj.discount || 0;
      obj.instructor = course.instructor
        ? {
            bio: course.instructor.bio,
            expertise: course.instructor.expertise,
            user: course.instructor.user,
          }
        : null;
      return obj;
    };

    const formattedCourse = formatCourse(course);

    res.json({
      success: true,
      data: formattedCourse,
    });
  } catch (error) {
    console.error('\n=== LỖI LẤY KHÓA HỌC THEO SLUG ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END LỖI ===\n');
    next(error);
  }
}; // Đóng ngoặc hàm getCourseBySlug

// Lấy danh sách chương học và bài học theo khóa học (public)
exports.getCourseSectionsAndLessons = async (req, res, next) => {
  try {
    const { course_id } = req.params;

    // Kiểm tra khóa học tồn tại và có trạng thái published
    const course = await Course.findOne({
      _id: course_id,
      displayStatus: 'published',
    });
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Lấy danh sách chương học và bài học
    const sections = await Section.find({ course_id })
      .sort({ position: 1 })
      .populate({
        path: 'lessons',
        select: 'title position is_preview',
        options: { sort: { position: 1 } },
      });

    // Lấy thông tin video và quiz cho từng lesson (chỉ duration, không có URL)
    const Video = require('../models/Video');
    const Quiz = require('../models/Quiz');
    const sectionsWithDetails = await Promise.all(
      sections.map(async section => {
        const lessonsWithDetails = await Promise.all(
          section.lessons.map(async lesson => {
            const videos = await Video.find({ lesson_id: lesson._id }).sort({ createdAt: 1 });
            const quiz = await Quiz.findOne({ lesson_id: lesson._id });
            return {
              _id: lesson._id,
              title: lesson.title,
              position: lesson.position,
              is_preview: lesson.is_preview,
              videos: videos.map(video => ({
                _id: video._id,
                duration: video.duration,
                description: video.description,
                status: video.status,
              })),
              quiz: quiz
                ? {
                    _id: quiz._id,
                    questions: quiz.questions,
                  }
                : null,
            };
          }),
        );
        return {
          _id: section._id,
          title: section.title,
          description: section.description,
          position: section.position,
          lessons: lessonsWithDetails,
        };
      }),
    );

    res.json({
      success: true,
      data: sectionsWithDetails,
    });
  } catch (error) {
    next(error);
  }
}; // Đóng ngoặc hàm getCourseSectionsAndLessons

exports.getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Không giới hạn displayStatus, cho phép admin xem mọi trạng thái
    const course = await Course.findOne({ _id: id })
      .populate('category', 'name')
      .populate({
        path: 'instructor',
        select: 'user bio expertise',
        populate: {
          path: 'user',
          select: 'fullname avatar',
        },
      });

    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Lấy danh sách chương học và bài học
    const sections = await Section.find({ course_id: id })
      .sort({ position: 1 })
      .populate({
        path: 'lessons',
        select: 'title position is_preview',
        options: { sort: { position: 1 } },
      });

    // Lấy thông tin video và quiz cho từng lesson
    const Video = require('../models/Video');
    const Quiz = require('../models/Quiz');
    const sectionsWithVideoDetails = await Promise.all(
      sections.map(async section => {
        const lessonsWithVideo = await Promise.all(
          section.lessons.map(async lesson => {
            const videos = await Video.find({ lesson_id: lesson._id }).sort({ createdAt: 1 });
            const quiz = await Quiz.findOne({ lesson_id: lesson._id });
            return {
              _id: lesson._id,
              title: lesson.title,
              position: lesson.position,
              is_preview: lesson.is_preview,
              videos: videos.map(video => ({
                _id: video._id,
                duration: video.duration,
                description: video.description,
                status: video.status,
                url: video.quality_urls?.get('high')?.url || null,
              })),
              quiz: quiz
                ? {
                    _id: quiz._id,
                    questions: quiz.questions,
                  }
                : null,
            };
          }),
        );
        return {
          _id: section._id,
          title: section.title,
          position: section.position,
          lessons: lessonsWithVideo,
        };
      }),
    );

    // Tăng lượt xem
    course.views = (course.views || 0) + 1;
    await course.save();

    const formatCourse = course => {
      const obj = course.toObject();
      // Tính toán giá cuối cùng dựa trên discount_amount và discount_percentage
      let finalPrice = obj.price;
      if (obj.discount_percentage > 0) {
        finalPrice = finalPrice * (1 - obj.discount_percentage / 100);
      }
      if (obj.discount_amount > 0) {
        finalPrice = Math.max(0, finalPrice - obj.discount_amount);
      }
      obj.finalPrice = Math.round(finalPrice);
      obj.discount_amount = obj.discount_amount || 0;
      obj.discount_percentage = obj.discount_percentage || 0;
      obj.instructor = course.instructor
        ? {
            bio: course.instructor.bio,
            expertise: course.instructor.expertise,
            user: course.instructor.user,
          }
        : null;
      return obj;
    };

    const formattedCourse = formatCourse(course);

    // Lấy số lượng học viên đã đăng ký
    const Enrollment = require('../models/Enrollment');
    const enrolledCount = await Enrollment.countDocuments({ course: id });

    res.json({
      success: true,
      data: {
        ...formattedCourse,
        sections: sectionsWithVideoDetails,
        enrolledCount: enrolledCount || 0,
      },
    });
  } catch (error) {
    console.error('\n=== LỖI LẤY CHI TIẾT KHÓA HỌC ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END LỖI ===\n');
    next(error);
  }
}; // Đóng ngoặc hàm getCourseById

// Lấy tất cả khóa học (có phân trang và bộ lọc)
exports.getAllCourses = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      level,
      language,
      minPrice,
      maxPrice,
      isFree,
      hasDiscount,
    } = req.query;

    const filter = {};
    // Chỉ hiển thị khóa học có trạng thái published
    filter.displayStatus = 'published';
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (language) filter.language = language;
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (isFree === 'true') filter.is_free = true;
    if (hasDiscount === 'true')
      filter.$or = [{ discount_amount: { $gt: 0 } }, { discount_percentage: { $gt: 0 } }];

    const courses = await Course.find(filter)
      .populate('category', 'name')
      .populate({
        path: 'instructor',
        select: 'user bio expertise',
        populate: {
          path: 'user',
          select: 'fullname avatar',
        },
      })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCourses = await Course.countDocuments(filter);

    const formatCourse = course => {
      const obj = course.toObject();
      obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
      obj.discount = obj.discount || 0;
      obj.instructor = course.instructor
        ? {
            bio: course.instructor.bio,
            expertise: course.instructor.expertise,
            user: course.instructor.user,
          }
        : null;
      return obj;
    };

    const formattedCourses = courses.map(formatCourse);

    res.status(200).json({
      success: true,
      data: formattedCourses,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCourses / limit),
        totalCourses,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách khóa học theo category
exports.getCoursesByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const courses = await Course.find({
      category: categoryId,
      displayStatus: 'published', // Chỉ hiển thị khóa học có trạng thái published
    })
      .populate('category', 'name')
      .populate({
        path: 'instructor',
        select: 'user bio expertise',
        populate: {
          path: 'user',
          select: 'fullname avatar',
        },
      });

    const formatCourse = course => {
      const obj = course.toObject();
      obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
      obj.discount = obj.discount || 0;
      obj.instructor = course.instructor
        ? {
            bio: course.instructor.bio,
            expertise: course.instructor.expertise,
            user: course.instructor.user,
          }
        : null;
      return obj;
    };

    const formattedCourses = courses.map(formatCourse);

    res.status(200).json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// Tìm kiếm khóa học
exports.searchCourses = async (req, res, next) => {
  try {
    const { searchTerm } = req.query;
    if (!searchTerm) {
      return res.status(200).json({ success: true, data: [] });
    }
    const courses = await Course.find({
      $text: { $search: searchTerm },
      displayStatus: 'published', // Chỉ hiển thị khóa học có trạng thái published
    })
      .populate('category', 'name')
      .populate({
        path: 'instructor',
        select: 'user bio expertise',
        populate: {
          path: 'user',
          select: 'fullname avatar',
        },
      });

    const formatCourse = course => {
      const obj = course.toObject();
      obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
      obj.discount = obj.discount || 0;
      obj.instructor = course.instructor
        ? {
            bio: course.instructor.bio,
            expertise: course.instructor.expertise,
            user: course.instructor.user,
          }
        : null;
      return obj;
    };

    const formattedCourses = courses.map(formatCourse);

    res.status(200).json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// Tham gia khóa học
exports.enrollCourse = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const courseId = req.params.courseId;

    console.log('🔍 Enroll request:', { userId, courseId });

    const course = await Course.findById(courseId);
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return res.status(404).json({ message: 'Không tìm thấy khóa học' });
    }

    console.log('📚 Course found:', { 
      id: course._id, 
      title: course.title, 
      status: course.status, 
      displayStatus: course.displayStatus,
      price: course.price,
      instructor: course.instructor
    });

    // Kiểm tra khóa học có được publish không
    if (course.status !== 'approved' || course.displayStatus !== 'published') {
      console.log('❌ Course not published:', { status: course.status, displayStatus: course.displayStatus });
      return res.status(403).json({ message: 'Khóa học chưa được phát hành' });
    }

    // Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
    if (course.instructor && course.instructor.toString() === userId.toString()) {
      console.log('❌ User is instructor of this course');
      return res.status(403).json({
        message:
          'Bạn không thể đăng ký khóa học của chính mình. Giảng viên đã có quyền truy cập đầy đủ vào khóa học của mình.',
      });
    }

    // Kiểm tra miễn phí hoặc đã mua
    const isFree = course.price === 0;
    // TODO: Thay thế đoạn này bằng logic kiểm tra đã mua thực tế
    const hasPurchased = isFree ? true : false; // Tạm thời chỉ cho phép miễn phí

    console.log('💰 Price check:', { isFree, hasPurchased, price: course.price });

    if (!isFree && !hasPurchased) {
      console.log('❌ Course not free and not purchased');
      return res.status(403).json({ message: 'Bạn cần mua khóa học này' });
    }

    // Đã enroll chưa?
    const alreadyEnrolled = await Enrollment.findOne({ student: userId, course: courseId });
    if (alreadyEnrolled) {
      console.log('ℹ️ User already enrolled');
      return res.json({ success: true, message: 'Bạn đã tham gia khóa học này' });
    }

    console.log('✅ Creating enrollment...');
    // Tạo enrollment
    await Enrollment.create({ student: userId, course: courseId });
    console.log('✅ Enrollment created successfully');
    res.json({ message: 'Tham gia thành công' });
  } catch (err) {
    console.error('❌ Enroll error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy danh sách khóa học của instructor hiện tại
exports.getInstructorCourses = async (req, res, next) => {
  try {
    let courses;

    // Nếu là admin, lấy tất cả khóa học
    if (req.user.roles.includes('admin')) {
      courses = await Course.find({})
        .populate('category', 'name')
        .populate({
          path: 'instructor',
          select: 'user bio expertise',
          populate: {
            path: 'user',
            select: 'fullname avatar',
          },
        })
        .sort({ createdAt: -1 });
    } else {
      // Nếu là instructor, chỉ lấy khóa học của mình
      const instructorProfile = await InstructorProfile.findOne({ user: req.user._id });

      if (!instructorProfile) {
        throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên');
      }

      courses = await Course.find({ instructor: instructorProfile._id })
        .populate('category', 'name')
        .populate({
          path: 'instructor',
          select: 'user bio expertise',
          populate: {
            path: 'user',
            select: 'fullname avatar',
          },
        })
        .sort({ createdAt: -1 });
    }

    const formatCourse = course => {
      const obj = course.toObject();
      // Tính toán giá cuối cùng dựa trên discount_amount và discount_percentage
      let finalPrice = obj.price;
      if (obj.discount_percentage > 0) {
        finalPrice = finalPrice * (1 - obj.discount_percentage / 100);
      }
      if (obj.discount_amount > 0) {
        finalPrice = Math.max(0, finalPrice - obj.discount_amount);
      }
      obj.finalPrice = Math.round(finalPrice);
      obj.discount_amount = obj.discount_amount || 0;
      obj.discount_percentage = obj.discount_percentage || 0;
      obj.instructor = course.instructor
        ? {
            bio: course.instructor.bio,
            expertise: course.instructor.expertise,
            user: course.instructor.user,
          }
        : null;
      return obj;
    };

    const formattedCourses = courses.map(formatCourse);

    res.json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách khóa học của instructor:', error);
    next(error);
  }
};

// Lấy thống kê khóa học
exports.getCourseStats = async (req, res, next) => {
  try {
    const { course_id } = req.params;

    // Tìm khóa học
    const course = await Course.findById(course_id);
    if (!course) {
      throw new ApiError(404, 'Không tìm thấy khóa học');
    }

    // Đếm số lượng học viên đã đăng ký
    const enrolledCount = await Enrollment.countDocuments({ course: course_id });

    // Tính điểm đánh giá trung bình và số lượng đánh giá
    const CourseReview = require('../models/CourseReview');
    const reviewStats = await CourseReview.aggregate([
      { $match: { course: course._id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    const stats = {
      enrolledCount: enrolledCount || 0,
      averageRating:
        reviewStats.length > 0 ? Math.round(reviewStats[0].averageRating * 10) / 10 : 0,
      reviewCount: reviewStats.length > 0 ? reviewStats[0].reviewCount : 0,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Lỗi khi lấy thống kê khóa học:', error);
    next(error);
  }
};
