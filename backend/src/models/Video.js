const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    lesson_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Bài học không được để trống'],
    },
    duration: {
      type: Number,
      required: [true, 'Thời lượng video không được để trống'],
    },
    quality_urls: {
      type: Map,
      of: new mongoose.Schema({
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      }),
      required: [true, 'Danh sách video theo chất lượng không được để trống'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Video', videoSchema);
