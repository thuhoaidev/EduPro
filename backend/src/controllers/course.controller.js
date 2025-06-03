const Course = require('../models/Course');
const { uploadToCloudinary, getPublicIdFromUrl, deleteFromCloudinary } = require('../utils/cloudinary');
const { validateSchema } = require('../utils/validateSchema');
const { createCourseSchema, updateCourseSchema, updateCourseStatusSchema } = require('../validations/course.validation');
const ApiError = require('../utils/ApiError');
// const Joi = require('joi'); // Không cần Joi ở đây nữa

// Tạo khóa học mới
exports.createCourse = async (req, res, next) => {
    try {
        // Xử lý thumbnail file upload trước
        let thumbnailUrl = '';
        if (req.file) {
            // Nếu có file được upload bởi multer, thực hiện upload lên Cloudinary
            const uploadResult = await uploadToCloudinary(req.file.path, 'courses');
            thumbnailUrl = uploadResult.secure_url;
        }

        // Kết hợp dữ liệu body và URL thumbnail
        // Nếu thumbnail là bắt buộc và không có file, Mongoose/Joi validation sẽ xử lý sau
        const courseData = {
            ...req.body,
            instructor: req.user ? req.user.instructorProfile : null, // Giả định instructor lấy từ user đăng nhập
            thumbnail: thumbnailUrl // Sử dụng URL từ upload hoặc chuỗi rỗng nếu không upload
        };

        // Validate toàn bộ dữ liệu đã kết hợp với schema đầy đủ
        // Joi và Mongoose schema validation (bao gồm cả thumbnail required) sẽ được chạy ở đây
        const validatedData = await validateSchema(createCourseSchema, courseData);

        // Tạo instance Course mới và lưu vào database
        // Mongoose schema validation cũng chạy lại ở đây
        const course = new Course(validatedData);
        await course.save();

        // Trả về response thành công
        res.status(201).json({
            success: true,
            data: course
        });

    } catch (error) {
        // Xử lý các lỗi xảy ra (validation, upload, database,...)
        next(error); // Chuyển tiếp lỗi đến middleware xử lý lỗi chung
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
            // Upload file mới
            const uploadResult = await uploadToCloudinary(req.file.path, 'courses');
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