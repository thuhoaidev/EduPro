const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  lesson_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 0,
  },
}, {
  timestamps: true,
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 