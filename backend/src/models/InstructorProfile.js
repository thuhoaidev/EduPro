const mongoose = require('mongoose');

const instructorProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    bio: {
        type: String,
        trim: true
    },
    expertise: [{
        type: String,
        trim: true
    }],
    education: [{
        degree: {
            type: String,
            trim: true,
            required: true
        },
        institution: {
            type: String,
            trim: true,
            required: true
        },
        year: {
            type: Number,
            required: true
        }
    }],
    experience: [{
        position: {
            type: String,
            trim: true,
            required: true
        },
        company: {
            type: String,
            trim: true,
            required: true
        },
        startYear: {
            type: Number,
            required: true
        },
        endYear: {
            type: Number
        }
    }],
    profileImage: {
        type: String
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },
    totalStudents: {
        type: Number,
        default: 0
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
    timestamps: true
});

// Indexes
instructorProfileSchema.index({ user: 1 });

const InstructorProfile = mongoose.model('InstructorProfile', instructorProfileSchema);
module.exports = InstructorProfile;
