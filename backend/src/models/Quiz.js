const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  video_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true, unique: true },
  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctIndex: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema); 