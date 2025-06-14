const Course = require('../models/Course');
const { uploadBufferToCloudinary, getPublicIdFromUrl, deleteFromCloudinary } = require('../utils/cloudinary');
const { validateSchema } = require('../utils/validateSchema');
const { createCourseSchema, updateCourseSchema, updateCourseStatusSchema } = require('../validations/course.validation');
const ApiError = require('../utils/ApiError');
const Section = require('../models/Section');
// const Joi = require('joi'); // Không cần Joi ở đây nữa

// Tạo khóa học mới
exports.createCourse = async (req, res, next) => {
    try {
        // Kiểm tra file thumbnail
        if (!req.file || !req.file.buffer) {
            console.log('Debug file upload:', {
                hasFile: !!req.file,
                fileInfo: req.file ? {
                    fieldname: req.file.fieldname,
                    originalname: req.file.originalname,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    hasBuffer: !!req.file.buffer
                } : null
            });
            throw new ApiError(400, 'Vui lòng tải lên ảnh đại diện cho khóa học');
        }

        // Tìm instructor profile của user hiện tại
        let instructorProfile;
        try {
            // Bỏ qua instructor từ body request vì chúng ta sẽ dùng user đang đăng nhập
            delete req.body.instructor;
            
            // Log rõ ràng hơn
            console.log('\n=== DEBUG INSTRUCTOR PROFILE ===');
            console.log('User ID từ token:', req.user.id);
            
            // Tìm profile với điều kiện đơn giản hơn
            instructorProfile = await InstructorProfile.findOne({ userId: req.user.id });
            
            if (!instructorProfile) {
                console.log('Không tìm thấy hồ sơ giảng viên nào cho user này');
                throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.');
            }
            
            console.log('Tìm thấy hồ sơ giảng viên:', {
                id: instructorProfile._id,
                userId: instructorProfile.userId,
                status: instructorProfile.status,
                bio: instructorProfile.bio,
                expertise: instructorProfile.expertise
            });
            
            if (instructorProfile.status !== 'approved') {
                console.log('Hồ sơ giảng viên chưa được duyệt. Trạng thái hiện tại:', instructorProfile.status);
                throw new ApiError(403, `Hồ sơ giảng viên của bạn đang ở trạng thái "${instructorProfile.status}". Vui lòng đợi được phê duyệt.`);
            }
            
            console.log('=== END DEBUG ===\n');
            
        } catch (instructorError) {
            console.error('\n=== LỖI CHI TIẾT ===');
            console.error('Error name:', instructorError.name);
            console.error('Error message:', instructorError.message);
            console.error('Error stack:', instructorError.stack);
            console.error('=== END LỖI ===\n');
            
            // Nếu là ApiError thì throw trực tiếp
            if (instructorError instanceof ApiError) {
                throw instructorError;
            }
            // Nếu là lỗi khác thì wrap trong ApiError
            throw new ApiError(500, 'Lỗi khi xác thực thông tin giảng viên: ' + instructorError.message);
        }

        // Upload thumbnail lên Cloudinary từ buffer
        let thumbnailUrl = '';
        try {
            console.log('Bắt đầu upload thumbnail lên Cloudinary...');
            const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'courses');
            thumbnailUrl = uploadResult.secure_url;
            console.log('Upload thumbnail thành công:', thumbnailUrl);
        } catch (uploadError) {
            console.error('Lỗi upload thumbnail:', uploadError);
            throw new ApiError(500, 'Lỗi khi tải lên ảnh đại diện: ' + uploadError.message);
        }

        // Chuẩn bị dữ liệu khóa học
        const courseData = {
            ...req.body,
            instructor: instructorProfile._id.toString(), // Chuyển ObjectId thành string
            thumbnail: thumbnailUrl, // URL từ Cloudinary
            price: Number(req.body.price), // Chuyển đổi price sang số
            discount: Number(req.body.discount || 0), // Chuyển đổi discount sang số, mặc định là 0
            requirements: Array.isArray(req.body.requirements) 
                ? req.body.requirements 
                : Object.keys(req.body)
                    .filter(key => key.startsWith('requirements['))
                    .map(key => req.body[key])
        };

        // Log dữ liệu trước khi validate
        console.log('\n=== COURSE DATA BEFORE VALIDATION ===');
        console.log(JSON.stringify(courseData, null, 2));
        console.log('=== END COURSE DATA ===\n');

        // Validate toàn bộ dữ liệu đã kết hợp với schema đầy đủ
        const validatedData = await validateSchema(createCourseSchema, courseData);

        // Chuyển instructor string trở lại thành ObjectId trước khi lưu vào database
        validatedData.instructor = instructorProfile._id;

        // Log dữ liệu sau khi validate
        console.log('\n=== VALIDATED COURSE DATA ===');
        console.log(JSON.stringify(validatedData, null, 2));
        console.log('=== END VALIDATED DATA ===\n');

        // Tạo instance Course mới và lưu vào database
        const course = new Course(validatedData);
        await course.save();

        // Trả về response thành công
        res.status(201).json({
            success: true,
            data: course
        });

    } catch (error) {
        // Xử lý các lỗi xảy ra (validation, upload, database,...)
        console.error('\n=== LỖI TẠO KHÓA HỌC ===');
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
            
            instructorProfile = await InstructorProfile.findOne({ userId: req.user.id });
            
            if (!instructorProfile) {
                console.log('Không tìm thấy hồ sơ giảng viên nào cho user này');
                throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.');
            }
            
            console.log('Tìm thấy hồ sơ giảng viên:', {
                id: instructorProfile._id,
                userId: instructorProfile.userId,
                status: instructorProfile.status,
                bio: instructorProfile.bio,
                expertise: instructorProfile.expertise
            });
            
            if (instructorProfile.status !== 'approved') {
                console.log('Hồ sơ giảng viên chưa được duyệt. Trạng thái hiện tại:', instructorProfile.status);
                throw new ApiError(403, `Hồ sơ giảng viên của bạn đang ở trạng thái "${instructorProfile.status}". Vui lòng đợi được phê duyệt.`);
            }

            // Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
            if (oldCourse.instructor._id.toString() !== instructorProfile._id.toString()) {
                throw new ApiError(403, 'Bạn không có quyền chỉnh sửa khóa học này');
            }
            
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
            price: req.body.price ? Number(req.body.price) : undefined,
            discount: req.body.discount ? Number(req.body.discount) : undefined,
            requirements: req.body.requirements ? (
                Array.isArray(req.body.requirements) 
                    ? req.body.requirements 
                    : Object.keys(req.body)
                        .filter(key => key.startsWith('requirements['))
                        .map(key => req.body[key])
            ) : undefined
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
                    { path: 'category', select: 'name' }
                ]
            }
        );

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        res.json({
            success: true,
            data: course
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

// Cập nhật trạng thái khóa học
exports.updateCourseStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = await validateSchema(updateCourseStatusSchema, req.body);

        const course = await Course.findByIdAndUpdate(
            id,
            { status },
            { 
                new: true, 
                runValidators: true,
                populate: [
                    { path: 'instructor', select: 'userId bio expertise rating' },
                    { path: 'category', select: 'name' }
                ]
            }
        );

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('\n=== LỖI CẬP NHẬT TRẠNG THÁI ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END LỖI ===\n');
        next(error);
    }
};

// Xóa khóa học
exports.deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Tìm và xóa khóa học
        const course = await Course.findById(id);
        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Xóa ảnh trên Cloudinary
        if (course.thumbnail && course.thumbnail.includes('res.cloudinary.com')) {
            try {
                const publicId = getPublicIdFromUrl(course.thumbnail);
                if (publicId) {
                    await deleteFromCloudinary(publicId);
                }
            } catch (deleteError) {
                console.error('Lỗi xóa ảnh trên Cloudinary:', deleteError);
                // Không throw error ở đây để vẫn xóa được course trong DB
            }
        }

        // Xóa khóa học trong database
        await Course.findByIdAndDelete(id);

        res.json({
            success: true,
            message: 'Xóa khóa học thành công',
            data: {
                id: course._id,
                title: course.title
            }
        });
    } catch (error) {
        console.error('\n=== LỖI XÓA KHÓA HỌC ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END LỖI ===\n');
        next(error);
    }
};

// Lấy danh sách khóa học
exports.getCourses = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            status,
            category,
            level,
            search,
            minPrice,
            maxPrice
        } = req.query;

        // Xây dựng query
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (level) query.level = level;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
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

        res.json({
            success: true,
            data: courses,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Lấy chi tiết khóa học theo ID
exports.getCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id)
            .populate('instructor', 'userId bio expertise rating')
            .populate('category', 'name');

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Tăng lượt xem
        course.views = (course.views || 0) + 1;
        await course.save();

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('\n=== LỖI LẤY CHI TIẾT KHÓA HỌC ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END LỖI ===\n');
        next(error);
    }
};

// Lấy khóa học theo slug
exports.getCourseBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const course = await Course.findOne({ slug })
            .populate('instructor', 'userId bio expertise rating')
            .populate('category', 'name');

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Tăng lượt xem
        course.views = (course.views || 0) + 1;
        await course.save();

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error('\n=== LỖI LẤY KHÓA HỌC THEO SLUG ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('=== END LỖI ===\n');
        next(error);
    }
};

// Lấy danh sách chương học và bài học theo khóa học
exports.getCourseSectionsAndLessons = async (req, res, next) => {
  try {
    const { course_id } = req.params;

    // Kiểm tra khóa học tồn tại
    const course = await Course.findById(course_id);
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

    res.json({
      success: true,
      data: sections,
    });
  } catch (error) {
    next(error);
  }
}; 