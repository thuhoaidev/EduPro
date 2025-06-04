const Course = require('../models/Course');
const { uploadBufferToCloudinary, getPublicIdFromUrl, deleteFromCloudinary } = require('../utils/cloudinary');
const { validateSchema } = require('../utils/validateSchema');
const { createCourseSchema, updateCourseSchema, updateCourseStatusSchema } = require('../validations/course.validation');
const ApiError = require('../utils/ApiError');
const InstructorProfile = require('../models/instructor/InstructorProfile');
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
        const oldCourse = await Course.findById(id);
        if (!oldCourse) {
             throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Xử lý thumbnail
        let thumbnailUrl = oldCourse.thumbnail; // Mặc định giữ ảnh cũ
        if (req.file) {
            // Upload file mới từ buffer
            const uploadResult = await uploadBufferToCloudinary(req.file.buffer, 'courses');
            thumbnailUrl = uploadResult.secure_url;

            // Xóa ảnh cũ trên Cloudinary nếu ảnh cũ tồn tại và là URL từ Cloudinary
            if (oldCourse.thumbnail && oldCourse.thumbnail.includes('res.cloudinary.com')) {
                 const publicId = getPublicIdFromUrl(oldCourse.thumbnail);
                 if (publicId) { await deleteFromCloudinary(publicId); }
            }
        } else if (req.body.thumbnail === null || req.body.thumbnail === '') {
            // Nếu client gửi thumbnail = null hoặc rỗng trong body (để xóa ảnh)
            thumbnailUrl = ''; // Set thumbnail thành rỗng
             // Xóa ảnh cũ trên Cloudinary nếu ảnh cũ tồn tại và là URL từ Cloudinary
            if (oldCourse.thumbnail && oldCourse.thumbnail.includes('res.cloudinary.com')) {
                 const publicId = getPublicIdFromUrl(oldCourse.thumbnail);
                 if (publicId) { await deleteFromCloudinary(publicId); }
            }
        }
        // Nếu req.file không có và req.body.thumbnail không phải null/rỗng,
        // thumbnailUrl vẫn giữ giá trị oldCourse.thumbnail


        // Kết hợp dữ liệu body và thumbnail URL xử lý
        const updateData = {
             ...req.body,
             thumbnail: thumbnailUrl
        };

         // Validate dữ liệu đã kết hợp với update schema đầy đủ
        // Joi và Mongoose schema validation sẽ chạy ở đây
         const validatedData = await validateSchema(updateCourseSchema, updateData);

         // Xóa trường thumbnail khỏi validatedData nếu không có sự thay đổi về thumbnail
        // (Tức là không có file upload mới VÀ client không gửi thumbnail=null/empty)
        // Điều này giúp tránh việc ghi đè thumbnail hiện có trong DB bằng giá trị rỗng nếu client không gửi trường thumbnail
         if (!req.file && req.body.thumbnail === undefined) {
             delete validatedData.thumbnail; // Giữ lại giá trị thumbnail cũ trong DB
         }

        const course = await Course.findByIdAndUpdate(
            id,
            { $set: validatedData },
            { new: true, runValidators: true }
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

// Cập nhật trạng thái khóa học
exports.updateCourseStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = await validateSchema(updateCourseStatusSchema, req.body);

        const course = await Course.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
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

// Xóa khóa học
exports.deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            throw new ApiError(404, 'Không tìm thấy khóa học');
        }

        // Xóa ảnh trên Cloudinary khi xóa khóa học (tùy chọn)
         if (course.thumbnail && course.thumbnail.includes('res.cloudinary.com')) {
              const publicId = getPublicIdFromUrl(course.thumbnail);
              if (publicId) { await deleteFromCloudinary(publicId); }
         }

        res.json({
            success: true,
            message: 'Xóa khóa học thành công'
        });
    } catch (error) {
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

// Lấy chi tiết khóa học
exports.getCourseById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findById(id)
            .populate('instructor', 'userId bio expertise rating')
            .populate('category', 'name');

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

        res.json({
            success: true,
            data: course
        });
    } catch (error) {
        next(error);
    }
}; 