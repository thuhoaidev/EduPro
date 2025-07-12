const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Video = require('../src/models/Video');
const Quiz = require('../src/models/Quiz');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/edupor')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample quiz data
const sampleQuizzes = [
  {
    questions: [
      {
        question: "HTML là viết tắt của gì?",
        options: [
          "HyperText Markup Language",
          "Home Tool Markup Language", 
          "Hyperlinks and Text Markup Language",
          "HyperText Making Language"
        ],
        correctIndex: 0
      },
      {
        question: "Thẻ nào được sử dụng để tạo tiêu đề lớn nhất trong HTML?",
        options: ["<h6>", "<h1>", "<header>", "<title>"],
        correctIndex: 1
      },
      {
        question: "Thuộc tính nào được sử dụng để thêm CSS inline?",
        options: ["class", "id", "style", "css"],
        correctIndex: 2
      }
    ]
  },
  {
    questions: [
      {
        question: "CSS là viết tắt của gì?",
        options: [
          "Computer Style Sheets",
          "Creative Style Sheets",
          "Cascading Style Sheets",
          "Colorful Style Sheets"
        ],
        correctIndex: 2
      },
      {
        question: "Cách nào để thay đổi màu nền trong CSS?",
        options: ["color", "background-color", "bgcolor", "background"],
        correctIndex: 1
      }
    ]
  },
  {
    questions: [
      {
        question: "JavaScript là ngôn ngữ lập trình gì?",
        options: [
          "Compiled language",
          "Interpreted language", 
          "Assembly language",
          "Machine language"
        ],
        correctIndex: 1
      },
      {
        question: "Cách khai báo biến trong JavaScript?",
        options: ["var", "let", "const", "Tất cả đều đúng"],
        correctIndex: 3
      },
      {
        question: "Hàm nào dùng để in ra console?",
        options: ["print()", "console.log()", "echo()", "alert()"],
        correctIndex: 1
      }
    ]
  }
];

async function createSampleQuizzes() {
  try {
    // Lấy danh sách video
    const videos = await Video.find().limit(3);
    console.log(`Found ${videos.length} videos`);

    if (videos.length === 0) {
      console.log('No videos found. Please create videos first.');
      return;
    }

    // Tạo quiz cho từng video
    for (let i = 0; i < Math.min(videos.length, sampleQuizzes.length); i++) {
      const video = videos[i];
      const quizData = sampleQuizzes[i];

      // Kiểm tra xem đã có quiz cho video này chưa
      const existingQuiz = await Quiz.findOne({ video_id: video._id });
      if (existingQuiz) {
        console.log(`Quiz already exists for video ${video._id}`);
        continue;
      }

      // Tạo quiz mới
      const quiz = new Quiz({
        video_id: video._id,
        questions: quizData.questions
      });

      await quiz.save();
      console.log(`Created quiz for video ${video._id} with ${quizData.questions.length} questions`);
    }

    console.log('Sample quizzes created successfully!');
  } catch (error) {
    console.error('Error creating sample quizzes:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleQuizzes(); 