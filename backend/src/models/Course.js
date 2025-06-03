const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InstructorProfile',
        required: [true, 'Giảng viên là bắt buộc']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Danh mục là bắt buộc']
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
        lowercase: true
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
        default: 'Vietnamese'
    },
    price: {
        type: Number,
        required: [true, 'Giá là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Giảm giá không được âm'],
        max: [100, 'Giảm giá không được vượt quá 100%']
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    requirements: [{
        type: String,
        required: true
    }],
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
courseSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            locale: 'vi'
        });
    }
    next();
});

// Virtual field cho giá sau khi giảm giá
courseSchema.virtual('finalPrice').get(function() {
    return this.price * (1 - this.discount / 100);
});

// Index cho các trường thường xuyên tìm kiếm
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ status: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ instructor: 1 });
courseSchema.index({ slug: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course; 