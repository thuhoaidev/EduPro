const Course = require('../models/Course');
const InstructorProfile = require('../models/InstructorProfile');
const { uploadBufferToCloudinary, getPublicIdFromUrl, deleteFromCloudinary } = require('../utils/cloudinary');
const { validateSchema } = require('../utils/validateSchema');
const { createCourseSchema, updateCourseSchema, updateCourseStatusSchema } = require('../validations/course.validation');
const ApiError = require('../utils/ApiError');
const Section = require('../models/Section');
const User = require('../models/User');

// Tạo khóa học mới
exports.createCourse = async (req, res, next) => {
    try {
        // Kiểm tra quyền truy cập
        if (!req.user.roles.includes('instructor') && !req.user.roles.includes('admin')) {
            throw new ApiError(403, 'Bạn không có quyền tạo khóa học');
        }

        // Log thông tin user
        console.log('\n=== DEBUG INSTRUCTOR PROFILE ===');
        console.log('User ID:', req.user._id);
        console.log('User roles:', req.user.roles);

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
                    console.log('Found and removing profile with null user_id...');
                    await nullProfile.remove();
                }
                instructorProfile = new InstructorProfile({
                    user: req.user._id,
                    email: req.user.email,
                    status: 'approved',
                    is_approved: true,
                    bio: req.user.bio,
                    fullname: req.user.fullname,
                    avatar: req.user.avatar
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
                    is_approved: instructorProfile.is_approved
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
                throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.');
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
        if (req.file && req.file.buffer) {
            console.log('Đang upload thumbnail...');
            try {
                const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'courses');
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
            instructor: req.instructorProfile._id.toString(), // Chuyển đổi thành string
            thumbnail: thumbnailUrl,
            price: Number(req.body.price),
            discount: Number(req.body.discount || 0),
            requirements: Array.isArray(req.body.requirements) ? req.body.requirements : [],
            category: req.body.category
        };

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
            validatedData.instructor = req.instructorProfile._id.toString(); // Đảm bảo instructor là string
            
            // Log dữ liệu sau validate
            console.log('=== DEBUG VALIDATED DATA ===');
            console.log('Validated Data:', JSON.stringify(validatedData, null, 2));

            // Tạo và lưu khóa học
            try {
                const course = new Course(validatedData);
                await course.save();

                // Trả về kết quả
                res.status(201).json({
                    success: true,
                    data: course
                });
            } catch (error) {
                console.error('Lỗi khi tạo khóa học:', error);
                if (error.name === 'ValidationError') {
                    console.error('Validation errors:', error.errors);
                    throw new ApiError(400, 'Dữ liệu không hợp lệ', error.errors);
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
                throw new ApiError(403, 'Bạn chưa có hồ sơ giảng viên. Vui lòng tạo hồ sơ giảng viên trước.');
            }
            
            console.log('Tìm thấy hồ sơ giảng viên:', {
                id: instructorProfile._id,
                userId: instructorProfile.userId,
                status: instructorProfile.status,
                is_approved: instructorProfile.is_approved,
                bio: instructorProfile.bio,
                expertise: instructorProfile.expertise
            });
            
            if (instructorProfile.status !== 'approved' || !instructorProfile.is_approved) {
                console.log('Hồ sơ giảng viên chưa được duyệt. Trạng thái hiện tại:', instructorProfile.status);
                throw new ApiError(403, `Hồ sơ giảng viên của bạn đang ở trạng thái "${instructorProfile.status}". Vui lòng đợi được phê duyệt.`);
            }

            // Kiểm tra xem người dùng có phải là giảng viên của khóa học này không
            if (course.instructor._id.toString() !== instructorProfile._id.toString()) {
                throw new ApiError(403, 'Bạn không có quyền xóa khóa học này');
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
                    is_approved: course.instructor.is_approved
                },
                category: {
                    id: course.category._id,
                    name: course.category.name
                }
            }
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
        const { status } = req.body;

        // Kiểm tra quyền
        const user = await User.findById(req.user.id);
        if (!user) {
            throw new ApiError(404, 'Người dùng không tồn tại');
        }

        if (!user.roles.includes('admin')) {
            throw new ApiError(403, 'Bạn không có quyền cập nhật trạng thái khóa học');
        }

        // Cập nhật trạng thái
        const course = await Course.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        res.json({
            success: true,
            data: course
        });
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

        const formatCourse = (course) => {
            const obj = course.toObject();
            obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
            obj.discount = obj.discount || 0;
            obj.instructor = course.instructor ? {
                bio: course.instructor.bio,
                expertise: course.instructor.expertise,
                user: course.instructor.user
            } : null;
            return obj;
        };

        const formattedCourses = courses.map(formatCourse);

        res.json({
            success: true,
            data: formattedCourses,
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
}; // Đóng ngoặc hàm getCourses

// Lấy khóa học theo slug
exports.getCourseBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const course = await Course.findOne({ slug })
            .populate({
                path: 'instructor',
                populate: {
                    path: 'user',
                    select: 'fullname avatar'
                }
            })
            .populate('category', 'name');

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Tăng lượt xem
        course.views = (course.views || 0) + 1;
        await course.save();

        const formatCourse = (course) => {
            const obj = course.toObject();
            obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
            obj.discount = obj.discount || 0;
            obj.instructor = course.instructor ? {
                bio: course.instructor.bio,
                expertise: course.instructor.expertise,
                user: course.instructor.user
            } : null;
            return obj;
        };

        const formattedCourse = formatCourse(course);

        res.json({
            success: true,
            data: formattedCourse
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
}; // Đóng ngoặc hàm getCourseSectionsAndLessons

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

        const formatCourse = (course) => {
            const obj = course.toObject();
            obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
            obj.discount = obj.discount || 0;
            obj.instructor = course.instructor ? {
                bio: course.instructor.bio,
                expertise: course.instructor.expertise,
                user: course.instructor.user
            } : null;
            return obj;
        };

        const formattedCourse = formatCourse(course);

        res.json({
            success: true,
            data: formattedCourse
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
            hasDiscount
        } = req.query;

        const filter = {};
        if (category) filter.category = category;
        if (level) filter.level = level;
        if (language) filter.language = language;
        if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
        if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
        if (isFree === 'true') filter.is_free = true;
        if (hasDiscount === 'true') filter.discount = { $gt: 0 };

        const courses = await Course.find(filter)
            .populate('category', 'name')
            .populate({
                path: 'instructor',
                select: 'user bio expertise',
                populate: {
                    path: 'user',
                    select: 'fullname avatar'
                }
            })
            .sort({ [sortBy]: sortOrder })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalCourses = await Course.countDocuments(filter);
        
        const formatCourse = (course) => {
            const obj = course.toObject();
            obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
            obj.discount = obj.discount || 0;
            obj.instructor = course.instructor ? {
                bio: course.instructor.bio,
                expertise: course.instructor.expertise,
                user: course.instructor.user
            } : null;
            return obj;
        };

        const formattedCourses = courses.map(formatCourse);

        res.status(200).json({
            success: true,
            data: formattedCourses,
            pagination: {
                currentPage: Number(page),
                totalPages: Math.ceil(totalCourses / limit),
                totalCourses
            }
        });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách khóa học theo category
exports.getCoursesByCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const courses = await Course.find({ category: categoryId })
            .populate('category', 'name')
            .populate({
                path: 'instructor',
                select: 'user bio expertise',
                populate: {
                    path: 'user',
                    select: 'fullname avatar'
                }
            });

        const formatCourse = (course) => {
            const obj = course.toObject();
            obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
            obj.discount = obj.discount || 0;
            obj.instructor = course.instructor ? {
                bio: course.instructor.bio,
                expertise: course.instructor.expertise,
                user: course.instructor.user
            } : null;
            return obj;
        };

        const formattedCourses = courses.map(formatCourse);

        res.status(200).json({
            success: true,
            data: formattedCourses
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
        const courses = await Course.find({ $text: { $search: searchTerm } })
            .populate('category', 'name')
            .populate({
                path: 'instructor',
                select: 'user bio expertise',
                populate: {
                    path: 'user',
                    select: 'fullname avatar'
                }
            });

        const formatCourse = (course) => {
            const obj = course.toObject();
            obj.finalPrice = Math.round(obj.price * (1 - (obj.discount || 0) / 100));
            obj.discount = obj.discount || 0;
            obj.instructor = course.instructor ? {
                bio: course.instructor.bio,
                expertise: course.instructor.expertise,
                user: course.instructor.user
            } : null;
            return obj;
        };

        const formattedCourses = courses.map(formatCourse);
        
        res.status(200).json({
            success: true,
            data: formattedCourses
        });
    } catch (error) {
        next(error);
    }
};