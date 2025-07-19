const mongoose = require('mongoose');
const slugify = require('slugify');
const courseSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstructorProfile',
        required: [true, 'Giảng viên là bắt buộc'],
        index: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Danh mục là bắt buộc'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Tiêu đề là bắt buộc'],
        trim: true,
        maxlength: [200, 'Tiêu đề không được vượt quá 200 ký tự']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Mô tả là bắt buộc'],
        trim: true
    },
    thumbnail: {
        type: String,
        required: [true, 'Ảnh đại diện là bắt buộc']
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: [true, 'Trình độ là bắt buộc']
    },
    language: {
        type: String,
        required: [true, 'Ngôn ngữ là bắt buộc'],
        enum: ['vi', 'en'],
        default: 'vi',
        get: function (value) {
            const languageMap = {
                'vi': 'Vietnamese',
                'en': 'English'
            };
            return languageMap[value] || value;
        },
        set: function (value) {
            const languageMap = {
                'Vietnamese': 'vi',
                'English': 'en',
                'vi': 'vi',
                'en': 'en'
            };
            return languageMap[value] || 'vi';
        }
    },
    price: {
        type: Number,
        required: [true, 'Giá là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    discount_amount: {
        type: Number,
        default: 0,
        min: [0, 'Giảm giá theo số tiền không được âm']
    },
    discount_percentage: {
        type: Number,
        default: 0,
        min: [0, 'Giảm giá theo phần trăm không được âm'],
        max: [100, 'Giảm giá theo phần trăm không được vượt quá 100%']
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft',
        index: true
    },
    displayStatus: {
        type: String,
        enum: ['hidden', 'published'],
        default: 'hidden',
        index: true
    },
    requirements: [{
        type: String,
        required: true
    }],
    views: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Tạo slug từ title trước khi lưu
courseSchema.pre('save', async function (next) {
    if (this.isModified('title')) {
        // Chuyển đổi tiếng Việt sang ASCII trước khi tạo slug
        const asciiTitle = this.title.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
            .replace(/[đĐ]/g, 'd'); // Chuyển đổi đ/Đ thành d

        let baseSlug = slugify(asciiTitle, {
            lower: true,
            strict: true,
            locale: 'en'
        });

        // Kiểm tra xem slug đã tồn tại chưa và tạo slug duy nhất
        let slug = baseSlug;
        let counter = 1;
        
        while (true) {
            const existingCourse = await this.constructor.findOne({ 
                slug: slug,
                _id: { $ne: this._id } // Loại trừ khóa học hiện tại khi update
            });
            
            if (!existingCourse) {
                break; // Slug không tồn tại, có thể sử dụng
            }
            
            // Slug đã tồn tại, thêm số vào cuối
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        
        this.slug = slug;
    }
    next();
});

// Virtual field cho giá sau khi giảm giá
courseSchema.virtual('finalPrice').get(function () {
    let finalPrice = this.price;
    
    // Áp dụng giảm giá theo phần trăm trước
    if (this.discount_percentage > 0) {
        finalPrice = finalPrice * (1 - this.discount_percentage / 100);
    }
    
    // Sau đó áp dụng giảm giá theo số tiền
    if (this.discount_amount > 0) {
        finalPrice = Math.max(0, finalPrice - this.discount_amount);
    }
    
    return Math.round(finalPrice);
});

// Tạo model
const Course = mongoose.model('Course', courseSchema);

// Tạo text index sau khi model được định nghĩa
Course.createIndexes({
    title: 'text',
    description: 'text'
}, {
    weights: {
        title: 10,
        description: 5
    },
    name: 'course_text_search'
}).catch(err => {
    if (err.message && err.message.includes('timed out')) {
        console.error('Lỗi khi tạo text index (timeout):', err.message);
        console.error('→ Hãy kiểm tra lại kết nối MongoDB, đảm bảo server MongoDB đang chạy và không bị quá tải.');
    } else {
        console.error('Lỗi khi tạo text index:', err.message);
    }
});

module.exports = Course; 