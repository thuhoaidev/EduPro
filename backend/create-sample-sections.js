const mongoose = require('mongoose');
const Section = require('./src/models/Section');
const Lesson = require('./src/models/Lesson');
const Video = require('./src/models/Video');
const Quiz = require('./src/models/Quiz');

// Kết nối database
mongoose.connect('mongodb://localhost:27017/edupromain', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleSections = async () => {
  try {
    const courseId = '68970bb443820bb84bc92711'; // ID khóa học từ log
    
    console.log('🎯 Bắt đầu tạo sections cho khóa học:', courseId);
    
    // Tạo sections mẫu
    const sectionsData = [
      {
        title: 'Chương 1: Giới thiệu khóa học',
        position: 0,
        lessons: [
          {
            title: 'Bài 1: Tổng quan khóa học',
            position: 0,
            is_preview: true,
            description: 'Tìm hiểu về nội dung và mục tiêu khóa học'
          },
          {
            title: 'Bài 2: Chuẩn bị môi trường học tập',
            position: 1,
            is_preview: false,
            description: 'Hướng dẫn cài đặt và chuẩn bị công cụ cần thiết'
          }
        ]
      },
      {
        title: 'Chương 2: Nội dung chính',
        position: 1,
        lessons: [
          {
            title: 'Bài 3: Kiến thức cơ bản',
            position: 0,
            is_preview: true,
            description: 'Học các khái niệm cơ bản'
          },
          {
            title: 'Bài 4: Thực hành',
            position: 1,
            is_preview: false,
            description: 'Áp dụng kiến thức vào thực tế'
          },
          {
            title: 'Bài 5: Quiz kiểm tra',
            position: 2,
            is_preview: false,
            description: 'Kiểm tra kiến thức đã học',
            quiz: {
              questions: [
                {
                  question: 'Câu hỏi 1: Bạn đã hiểu nội dung khóa học chưa?',
                  options: ['Rất hiểu', 'Hiểu', 'Chưa hiểu rõ', 'Không hiểu'],
                  correctIndex: 1
                },
                {
                  question: 'Câu hỏi 2: Bạn có muốn tiếp tục học không?',
                  options: ['Có', 'Không', 'Cần thêm thời gian', 'Chưa quyết định'],
                  correctIndex: 0
                }
              ]
            }
          }
        ]
      },
      {
        title: 'Chương 3: Tổng kết',
        position: 2,
        lessons: [
          {
            title: 'Bài 6: Ôn tập',
            position: 0,
            is_preview: false,
            description: 'Tổng hợp lại các kiến thức đã học'
          },
          {
            title: 'Bài 7: Dự án cuối khóa',
            position: 1,
            is_preview: false,
            description: 'Áp dụng tất cả kiến thức vào dự án thực tế'
          }
        ]
      }
    ];

    // Tạo sections
    for (const sectionData of sectionsData) {
      console.log(`📝 Tạo section: ${sectionData.title}`);
      
      // Tạo section
      const section = new Section({
        course_id: courseId,
        title: sectionData.title,
        position: sectionData.position
      });
      await section.save();
      console.log(`✅ Đã tạo section: ${section.title} (ID: ${section._id})`);

      // Tạo lessons cho section
      for (const lessonData of sectionData.lessons) {
        console.log(`📚 Tạo lesson: ${lessonData.title}`);
        
        const lesson = new Lesson({
          section_id: section._id,
          title: lessonData.title,
          position: lessonData.position,
          is_preview: lessonData.is_preview || false,
          description: lessonData.description
        });
        await lesson.save();
        console.log(`✅ Đã tạo lesson: ${lesson.title} (ID: ${lesson._id})`);

        // Tạo video mẫu cho lesson
        const video = new Video({
          lesson_id: lesson._id,
          description: lessonData.description || 'Video hướng dẫn',
          duration: 300, // 5 phút
          status: 'published',
          quality_urls: {
            high: {
              url: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
              public_id: `sample_video_${lesson._id}`
            }
          }
        });
        await video.save();
        console.log(`🎥 Đã tạo video cho lesson: ${lesson.title}`);

        // Tạo quiz nếu có
        if (lessonData.quiz) {
          const quiz = new Quiz({
            lesson_id: lesson._id,
            questions: lessonData.quiz.questions
          });
          await quiz.save();
          console.log(`📝 Đã tạo quiz cho lesson: ${lesson.title}`);
        }

        // Cập nhật section với lesson
        section.lessons.push(lesson._id);
      }
      
      await section.save();
      console.log(`✅ Đã cập nhật section ${section.title} với ${section.lessons.length} lessons`);
    }

    console.log('🎉 Hoàn thành tạo sections mẫu!');
    console.log('📊 Tổng kết:');
    console.log(`- Sections: ${sectionsData.length}`);
    console.log(`- Lessons: ${sectionsData.reduce((total, section) => total + section.lessons.length, 0)}`);
    console.log(`- Videos: ${sectionsData.reduce((total, section) => total + section.lessons.length, 0)}`);
    console.log(`- Quizzes: ${sectionsData.reduce((total, section) => total + section.lessons.filter(l => l.quiz).length, 0)}`);

  } catch (error) {
    console.error('❌ Lỗi khi tạo sections:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Đã đóng kết nối database');
  }
};

createSampleSections();
