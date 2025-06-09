const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Bài học không được để trống'],
    },
    url: {
      type: String,
      required: [true, 'URL video không được để trống'],
    },
    duration: {
      type: Number,
      required: [true, 'Thời lượng video không được để trống'],
    },
    public_id: {
      type: String,
      required: [true, 'Public ID không được để trống'],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Video', videoSchema);