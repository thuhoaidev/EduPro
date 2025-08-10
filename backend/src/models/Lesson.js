const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    section_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section',
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
    is_preview: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft',
        index: true
    }
}, {
    timestamps: true
});

// Tự động cập nhật position khi tạo mới lesson
lessonSchema.pre('save', async function(next) {
    if (this.isNew) {
        const lastLesson = await this.constructor.findOne({ section_id: this.section_id })
            .sort({ position: -1 });
        this.position = lastLesson ? lastLesson.position + 1 : 0;
    }
    next();
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson; 