const mongoose = require('mongoose');

const instructorProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        default: ''
    },
    expertise: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    education: [{
        degree: String,
        field: String,
        institution: String,
        year: Number,
        description: String
    }],
    experience: [{
        position: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String
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
    timestamps: true
});

// Tạo index cho các trường thường xuyên tìm kiếm
instructorProfileSchema.index({ status: 1 });
instructorProfileSchema.index({ rating: -1 });

// Middleware để tự động cập nhật updatedAt
instructorProfileSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Phương thức để tính toán rating trung bình
instructorProfileSchema.methods.calculateAverageRating = async function () {
    const Review = mongoose.model('Review');
    const Course = mongoose.model('Course');

    try {
        // Lấy tất cả khóa học của giảng viên
        const courses = await Course.find({ instructor: this.userId });
        const courseIds = courses.map(course => course._id);

        // Tính toán rating trung bình
        const result = await Review.aggregate([
            {
                $match: {
                    courseId: { $in: courseIds }
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        if (result.length > 0) {
            this.rating = parseFloat(result[0].averageRating.toFixed(1));
            await this.save();
        }

        return this.rating;
    } catch (error) {
        console.error('Lỗi khi tính toán rating:', error);
        throw error;
    }
};

const InstructorProfile = mongoose.model('InstructorProfile', instructorProfileSchema);

module.exports = InstructorProfile; 