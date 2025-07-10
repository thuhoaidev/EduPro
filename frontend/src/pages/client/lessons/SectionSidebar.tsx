import React from 'react';
import { Card, Typography, Progress, Tooltip } from 'antd';
import { LockOutlined, CheckCircleTwoTone, PlayCircleTwoTone, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

type Lesson = { _id: string; title: string };
type Section = { _id: string; title: string; lessons: Lesson[] };

type Props = {
  sections: Section[];
  unlockedLessons: string[];
  currentLessonId: string | null;
  progress: any;
  onSelectLesson: (lessonId: string) => void;
};

const SectionSidebar: React.FC<Props> = ({ sections, unlockedLessons, currentLessonId, progress, onSelectLesson }) => {
  const completedLessons = Array.isArray(progress?.completedLessons) ? progress.completedLessons : [];
  const lastWatched = progress?.lastWatched;

  // Debug log danh sách bài học
  console.log('SectionSidebar - sections:', sections);
  console.log('SectionSidebar - unlockedLessons:', unlockedLessons);
  console.log('SectionSidebar - completedLessons:', completedLessons);

  // Helper: lấy phần trăm đã xem của từng bài học từ progress
  const getLessonVideoPercent = (lessonId: string) => {
    const lessonProgress = progress && progress[lessonId];
    if (lessonProgress && lessonProgress.videoDuration && lessonProgress.watchedSeconds) {
      return Math.min(100, Math.round((lessonProgress.watchedSeconds / lessonProgress.videoDuration) * 100));
    }
    return 0;
  };

  if (!sections.length) {
    return <Card variant="outlined"><ClockCircleOutlined spin style={{ fontSize: 32, color: '#1890ff' }} /></Card>;
  }
  return (
    <Card variant="outlined" className="shadow-md rounded-xl bg-gradient-to-br from-cyan-50 via-white to-purple-50">
      <Title level={4} className="mb-4 text-cyan-700">Nội dung khóa học</Title>
      <div className="overflow-y-auto max-h-[80vh] pr-2">
        {sections.map((section, sIdx) => (
          <div key={section._id} className="mb-6">
            <div className="font-semibold text-cyan-700 mb-2 text-base">Chương {sIdx + 1}: {section.title}</div>
            <ul className="pl-2">
              {section.lessons.map((lesson, lIdx) => {
                // Đảm bảo so sánh unlockedLessons và lesson._id đều là string
                const lessonIdStr = String(lesson._id);
                const unlocked = unlockedLessons.map(String).includes(lessonIdStr) || completedLessons.map(String).includes(lessonIdStr);
                // Debug log
                // console.log('lessonId:', lessonIdStr, 'unlocked:', unlocked, 'unlockedLessons:', unlockedLessons);
                const isCurrent = lessonIdStr === currentLessonId;
                const isCompleted = completedLessons.map(String).includes(lessonIdStr);
                let progressValue = getLessonVideoPercent(lessonIdStr);
                let progressColor = '#d9d9d9';
                let showProgress = false;
                if (isCompleted) {
                  progressValue = 100;
                  progressColor = '#52c41a';
                  showProgress = true;
                } else if (isCurrent) {
                  progressColor = '#1890ff';
                  showProgress = true;
                } else if (lastWatched && lessonIdStr === lastWatched) {
                  progressColor = '#faad14';
                  showProgress = true;
                } else if (unlocked && progressValue > 0) {
                  progressColor = '#faad14';
                  showProgress = true;
                }
                return (
                  <li
                    key={lessonIdStr}
                    className={`mb-2 flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-200 ${isCurrent ? 'bg-cyan-100 font-bold shadow' : 'hover:bg-cyan-50'} ${!unlocked ? 'opacity-60' : 'cursor-pointer'}`}
                    style={{ pointerEvents: unlocked ? 'auto' : 'none' }}
                    onClick={() => unlocked && onSelectLesson(lesson._id)}
                  >
                    <span className="mr-1 text-gray-400 text-xs">{lIdx + 1}.</span>
                    {isCompleted ? (
                      <Tooltip title="Đã hoàn thành">
                        <CheckCircleTwoTone twoToneColor="#52c41a" className="mr-1" />
                      </Tooltip>
                    ) : isCurrent ? (
                      <Tooltip title="Đang học">
                        <PlayCircleTwoTone twoToneColor="#1890ff" className="mr-1" />
                      </Tooltip>
                    ) : !unlocked ? (
                      <Tooltip title="Chưa mở khóa">
                        <LockOutlined className="mr-1 text-gray-400" />
                      </Tooltip>
                    ) : null}
                    <span className={`flex-1 truncate ${isCurrent ? 'text-cyan-700' : 'text-gray-800'}`}>{lesson.title}</span>
                    {showProgress && unlocked && !isCompleted && progressValue > 0 && (
                      <Tooltip title={`Đã xem ${progressValue}%`}>
                        <Progress percent={progressValue} size="small" showInfo={false} strokeColor={progressColor} style={{ width: 60 }} />
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SectionSidebar; 