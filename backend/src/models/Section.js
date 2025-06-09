const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: Number,
        required: true,
        default: 0
    },
    lessons: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }]
}, {
    timestamps: true
});

// Tự động cập nhật position khi tạo mới section
sectionSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastSection = await this.constructor.findOne({ course_id: this.course_id })
            .sort({ position: -1 });
        this.position = lastSection ? lastSection.position + 1 : 0;
    }
    next();
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section; 