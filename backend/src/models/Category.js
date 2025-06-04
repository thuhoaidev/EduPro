const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên danh mục là bắt buộc'],
        unique: true,
        trim: true,
        maxlength: [100, 'Tên danh mục không được vượt quá 100 ký tự']
    },
    description: {
        type: String,
        default: '',
        trim: true
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

// Virtual populate cho danh mục con
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Index cho các trường thường xuyên tìm kiếm
categorySchema.index({ name: 1 });
categorySchema.index({ parent: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category; 