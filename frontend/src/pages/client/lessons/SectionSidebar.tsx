import React, { useState } from 'react';
import { Card, Typography, Progress, Tooltip } from 'antd';
import { LockOutlined, CheckCircleTwoTone, PlayCircleTwoTone, ClockCircleOutlined, PauseCircleTwoTone, RightOutlined, DownOutlined } from '@ant-design/icons';

const { Title } = Typography;

type Lesson = { _id: string; title: string };
type Section = { _id: string; title: string; lessons: Lesson[] };

type Props = {
  sections: Section[];
  unlockedLessons: string[];
  currentLessonId: string | null;
  progress: any;
  currentVideoProgress?: number;
  isVideoPlaying?: boolean;
  onSelectLesson: (lessonId: string) => void;
};

const SectionSidebar: React.FC<Props> = ({ sections, unlockedLessons, currentLessonId, progress, currentVideoProgress, isVideoPlaying, onSelectLesson }) => {
  const completedLessons = Array.isArray(progress?.completedLessons) ? progress.completedLessons : [];
  const lastWatched = progress?.lastWatched;

  // State quản lý section nào đang mở
  const [openSections, setOpenSections] = useState<{ [sectionId: string]: boolean }>({});
  const toggleSection = (sectionId: string) => {
    setOpenSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Debug log danh sách bài học
  // console.log('SectionSidebar - sections:', sections);
  // console.log('SectionSidebar - unlockedLessons:', unlockedLessons);
  // console.log('SectionSidebar - completedLessons:', completedLessons);

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
    <Card
      variant="outlined"
      className="shadow-lg rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #f0f7ff 0%, #f8f5ff 60%, #f8f5ff 100%)',
        borderRadius: 24,
        boxShadow: '0 8px 32px #b6e0fe44',
        padding: 24,
        border: 'none',
        margin: 0
      }}
    >
      <div className="overflow-y-auto max-h-[80vh] pr-2 hide-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={section._id} className="mb-7">
            {/* Tiêu đề chương nổi bật */}
            <div
              className="flex items-center cursor-pointer select-none mb-2"
              onClick={() => toggleSection(section._id)}
              style={{
                fontWeight: 700,
                fontSize: 16,
                background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: 0.5,
                borderRadius: 12,
                padding: '8px 10px',
                transition: 'background 0.2s, box-shadow 0.2s',
                userSelect: 'none',
                boxShadow: openSections[section._id] ? '0 4px 16px #bae6fd' : undefined,
                backgroundColor: openSections[section._id] ? '#e0f2fe' : 'transparent',
                marginBottom: 4,
                borderBottom: '1.5px solid #e0e7ef',
                position: 'relative',
                zIndex: 2
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = openSections[section._id] ? '#e0f2fe' : 'transparent')}
            >
                <span style={{ fontSize: 22, marginRight: 14, display: 'inline-flex', alignItems: 'center', transition: 'transform 0.2s', color: '#06b6d4' }}>
                  {openSections[section._id] ? <DownOutlined /> : <RightOutlined />}
                </span>
                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.title}</span>
              </div>
            {openSections[section._id] && (
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
                  // Nếu là bài học hiện tại và có currentVideoProgress thì dùng giá trị này
                  if (isCurrent && typeof currentVideoProgress === 'number') {
                    progressValue = currentVideoProgress;
                  }
                  let progressColor = '#d9d9d9';
                  let showProgress = false;
                  if (progressValue === 100 || isCompleted) {
                    progressValue = 100;
                    progressColor = '#52c41a'; // xanh lá
                    showProgress = true;
                  } else if (isCurrent) {
                    progressColor = '#06b6d4';
                    showProgress = true;
                  } else if (lastWatched && lessonIdStr === lastWatched) {
                    showProgress = true;
                  } else if (unlocked && progressValue > 0) {
                    progressColor = '#faad14';
                    showProgress = true;
                  }
                  return (
                    <li
                      key={lessonIdStr}
                      className={`mb-2 flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-200 ${isCurrent ? 'bg-cyan-100 font-bold shadow-lg border-l-4 border-cyan-400' : 'hover:bg-cyan-50'} ${!unlocked ? 'opacity-60' : 'cursor-pointer'}`}
                      style={{ pointerEvents: unlocked ? 'auto' : 'none', fontSize: 16, fontWeight: isCurrent ? 800 : 500, color: isCurrent ? '#06b6d4' : '#222', background: isCurrent ? '#e0f2fe' : undefined, boxShadow: isCurrent ? '0 2px 8px #bae6fd' : undefined }}
                      onClick={() => unlocked && onSelectLesson(lesson._id)}
                    >
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 34,
                        height: 34,
                        marginRight: 7,
                        position: 'relative',
                        boxShadow: isCurrent ? '0 2px 8px #bae6fd' : undefined
                      }}>
                        <Progress
                          type="circle"
                          percent={progressValue}
                          size={34}
                          strokeColor={progressColor}
                          showInfo={false}
                          strokeWidth={7}
                          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                        />
                        <span style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: 34,
                          height: 34,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 14,
                          color: isCurrent ? 'url(#lesson-gradient)' : '#222',
                          zIndex: 1,
                          background: isCurrent ? 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)' : 'none',
                          WebkitBackgroundClip: isCurrent ? 'text' : undefined,
                          WebkitTextFillColor: isCurrent ? 'transparent' : undefined
                        }}>{lIdx + 1}</span>
                      </span>
                      {isCompleted ? (
                        <Tooltip title="Đã hoàn thành">
                          <CheckCircleTwoTone twoToneColor="#52c41a" className="mr-1" />
                        </Tooltip>
                      ) : isCurrent ? (
                        <Tooltip title={isVideoPlaying ? "Đang phát" : "Đang dừng"}>
                          {isVideoPlaying ? (
                            <PauseCircleTwoTone twoToneColor="#06b6d4" className="mr-1" />
                          ) : (
                            <PlayCircleTwoTone twoToneColor="#06b6d4" className="mr-1" />
                          )}
                        </Tooltip>
                      ) : !unlocked ? (
                        <Tooltip title="Chưa mở khóa">
                          <LockOutlined className="mr-1 text-gray-400" />
                        </Tooltip>
                      ) : null}
                      <span className={`flex-1 truncate ${isCurrent ? 'text-cyan-700' : 'text-gray-800'}`} style={{ fontWeight: isCurrent ? 600 : 500, fontSize: 15 }}>{lesson.title}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SectionSidebar; 