import React, { useState, useEffect } from 'react';
import { Card, Typography, Progress, Tooltip } from 'antd';
import {
  LockOutlined,
  CheckCircleTwoTone,
  PlayCircleTwoTone,
  ClockCircleOutlined,
  PauseCircleTwoTone,
  RightOutlined,
  DownOutlined,
} from '@ant-design/icons';

const { Title } = Typography;

type Lesson = { _id: string; title: string };
type Section = { _id: string; title: string; lessons: Lesson[] };
type Certificate = { code: string; issuedAt: string; file?: string; fileUrl?: string };

type Props = {
  sections: Section[];
  unlockedLessons: string[];
  currentLessonId: string | null;
  progress: any;
  currentVideoProgress?: number;
  isVideoPlaying?: boolean;
  onSelectLesson: (lessonId: string) => void;
  isCompleted?: boolean;
  onIssueCertificate?: () => void;
  certificate?: Certificate | null;
  isLoadingCertificate?: boolean;
};

const SectionSidebar: React.FC<Props> = ({ sections, unlockedLessons, currentLessonId, progress, currentVideoProgress, isVideoPlaying, onSelectLesson, isCompleted, onIssueCertificate, certificate, isLoadingCertificate }) => {
  // Đặt tất cả hook ở đầu function component
  const [openSections, setOpenSections] = useState<{ [sectionId: string]: boolean }>({});
  const [userToggled, setUserToggled] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const completedLessons = Array.isArray(progress?.completedLessons) ? progress.completedLessons : [];
  const lastWatched = progress?.lastWatched;



  // Auto open the section containing the current lesson when currentLessonId changes, unless user has toggled
  useEffect(() => {
    if (!currentLessonId || userToggled) return;
    let foundSectionId: string | null = null;
    for (const section of sections) {
      if (section.lessons.some((lesson) => String(lesson._id) === String(currentLessonId))) {
        foundSectionId = section._id;
        break;
      }
    }
    if (foundSectionId) {
      setOpenSections(
        sections.reduce((acc, section) => {
          acc[section._id] = section._id === foundSectionId;
          return acc;
        }, {} as { [sectionId: string]: boolean })
      );
    }
  }, [currentLessonId, sections, userToggled]);

  useEffect(() => {
    setUserToggled(false);
  }, [currentLessonId]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
    setUserToggled(true);
  };

  const getLessonVideoPercent = (lessonId: string) => {
    const lessonProgress = progress && progress[lessonId];
    if (lessonProgress && lessonProgress.videoDuration && lessonProgress.watchedSeconds) {
      return Math.min(100, Math.round((lessonProgress.watchedSeconds / lessonProgress.videoDuration) * 100));
    }
    return 0;
  };

  if (!sections.length) {
    return (
      <Card variant="outlined">
        <ClockCircleOutlined spin style={{ fontSize: 32, color: '#1890ff' }} />
      </Card>
    );
  }

  // Hàm tải chứng chỉ PDF (dùng fetch truyền token)
  const handleDownloadCertificate = async () => {
    if (!certificate?.file && !(certificate?.fileUrl && certificate?.fileUrl.split('/').pop())) return;
    const fileName = certificate.file || (certificate.fileUrl && certificate.fileUrl.split('/').pop());
    if (!fileName) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để tải chứng chỉ!');
      return;
    }
    try {
      const res = await fetch(`/api/certificates/download/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        alert('Không thể tải chứng chỉ!');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Có lỗi khi tải chứng chỉ!');
    }
  };

  // Xem trước chứng chỉ PDF
  const handlePreviewCertificate = async () => {
    if (!certificate?.file && !(certificate?.fileUrl && certificate.fileUrl.split('/').pop())) return;
    const fileName = certificate.file || (certificate.fileUrl && certificate.fileUrl.split('/').pop());
    if (!fileName) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để xem chứng chỉ!');
      return;
    }
    try {
      const res = await fetch(`/api/certificates/download/${fileName}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Certificate preview error:', res.status, errorData);
        alert(`Không thể xem trước chứng chỉ! Lỗi: ${errorData.message || res.statusText}`);
        return;
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        alert('File chứng chỉ trống hoặc không hợp lệ!');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Certificate preview error:', err);
      alert('Có lỗi khi xem trước chứng chỉ! Vui lòng thử lại sau.');
    }
  };

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
        margin: 0,
      }}
    >
      <div className="overflow-y-auto max-h-[80vh] pr-2 hide-scrollbar">
        {sections.map((section, sIdx) => (
          <div key={section._id} className="mb-7">
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
                zIndex: 2,
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = openSections[section._id] ? '#e0f2fe' : 'transparent')}
            >
              <span
                style={{
                  fontSize: 22,
                  marginRight: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  transition: 'transform 0.2s',
                  color: '#06b6d4',
                }}
              >
                {openSections[section._id] ? <DownOutlined /> : <RightOutlined />}
              </span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{section.title}</span>
            </div>
            {openSections[section._id] && (
              <ul className="pl-2">
                {section.lessons.map((lesson, lIdx) => {
                  const lessonIdStr = String(lesson._id);
                  // Sử dụng unlockedLessons array từ props thay vì logic phức tạp
                  let unlocked = unlockedLessons.map(String).includes(lessonIdStr);
                  const isFirstLesson = sIdx === 0 && lIdx === 0;

                  // Bài học đầu tiên luôn được mở khóa
                  if (isFirstLesson) {
                    unlocked = true;
                  }

                  const isCompleted = completedLessons.map(String).includes(lessonIdStr);

                  // Nếu đã hoàn thành, luôn unlocked
                  if (isCompleted) unlocked = true;

                  const isCurrent = lessonIdStr === currentLessonId;
                  let progressValue = getLessonVideoPercent(lessonIdStr);
                  if (isCurrent && typeof currentVideoProgress === 'number') {
                    progressValue = currentVideoProgress;
                  }

                  let progressColor = '#d9d9d9';
                  let showProgress = false;

                  // Kiểm tra trạng thái hoàn thành từ progress
                  const lessonProgress = progress && progress[lessonIdStr];
                  const isVideoCompleted = lessonProgress && lessonProgress.videoCompleted;
                  const isQuizPassed = lessonProgress && lessonProgress.quizPassed;
                  const isFullyCompleted = isVideoCompleted && isQuizPassed;

                  if (isCompleted || isFullyCompleted) {
                    progressValue = 100;
                    progressColor = '#52c41a'; // xanh lá - hoàn thành
                    showProgress = true;
                  } else if (isCurrent) {
                    progressColor = '#06b6d4'; // xanh dương - đang học
                    showProgress = true;
                  } else if (lastWatched && lessonIdStr === lastWatched) {
                    progressColor = '#faad14'; // vàng - đã xem một phần
                    showProgress = true;
                  } else if (unlocked && progressValue > 0) {
                    progressColor = '#faad14'; // vàng - đã xem một phần
                    showProgress = true;
                  }

                  return (
                    <li
                      key={lessonIdStr}
                      className={`mb-2 flex items-center gap-2 px-2 py-2 rounded-xl transition-all duration-200 ${isCurrent ? 'bg-cyan-100 font-bold shadow-lg border-l-4 border-cyan-400' : 'hover:bg-cyan-50'
                        } ${!(unlocked || isCompleted) ? 'opacity-60' : 'cursor-pointer'}`}
                      style={{
                        pointerEvents: (unlocked || isCompleted) ? 'auto' : 'none',
                        fontSize: 16,
                        fontWeight: isCurrent ? 800 : 500,
                        color: isCurrent ? '#06b6d4' : '#222',
                        background: isCurrent ? '#e0f2fe' : undefined,
                        boxShadow: isCurrent ? '0 2px 8px #bae6fd' : undefined,
                      }}
                      onClick={() => (unlocked || isCompleted) && onSelectLesson(lesson._id)}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 34,
                          height: 34,
                          marginRight: 7,
                          position: 'relative',
                          boxShadow: isCurrent ? '0 2px 8px #bae6fd' : undefined,
                        }}
                      >
                        <Progress
                          type="circle"
                          percent={progressValue}
                          size={34}
                          strokeColor={progressColor}
                          showInfo={false}
                          strokeWidth={7}
                          style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                        />
                        <span
                          style={{
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
                            background: isCurrent
                              ? 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)'
                              : 'none',
                            WebkitBackgroundClip: isCurrent ? 'text' : undefined,
                            WebkitTextFillColor: isCurrent ? 'transparent' : undefined,
                          }}
                        >
                          {lIdx + 1}
                        </span>
                      </span>
                      {isCompleted ? (
                        <Tooltip title="Đã hoàn thành">
                          <CheckCircleTwoTone twoToneColor="#52c41a" className="mr-1" />
                        </Tooltip>
                      ) : isCurrent ? (
                        <Tooltip title={isVideoPlaying ? 'Đang phát' : 'Đang dừng'}>
                          {isVideoPlaying ? (
                            <PauseCircleTwoTone twoToneColor="#06b6d4" className="mr-1" />
                          ) : (
                            <PlayCircleTwoTone twoToneColor="#06b6d4" className="mr-1" />
                          )}
                        </Tooltip>
                      ) : (!unlocked && !isCompleted) ? (
                        <Tooltip title="Chưa mở khóa">
                          <LockOutlined className="mr-1 text-gray-400" />
                        </Tooltip>
                      ) : null}
                      <span
                        className={`flex-1 truncate ${isCurrent ? 'text-cyan-700' : 'text-gray-800'}`}
                        style={{ fontWeight: isCurrent ? 600 : 500, fontSize: 15 }}
                      >
                        {lesson.title}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>

      {isCompleted && (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          {certificate ? (
            <div>
              <div style={{ fontWeight: 700, color: '#52c41a', fontSize: 18, marginBottom: 8 }}>
                🎉 Bạn đã nhận chứng chỉ!
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>Mã chứng chỉ:</span> {certificate.code}
              </div>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontWeight: 600 }}>Ngày cấp:</span>{' '}
                {new Date(certificate.issuedAt).toLocaleDateString()}
              </div>
              {certificate.file || certificate.fileUrl ? (
                <div style={{ display: 'flex', gap: 12, flexDirection: 'column', alignItems: 'center' }}>
                  <button
                    style={{
                      background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 24,
                      padding: '12px 32px',
                      fontWeight: 700,
                      fontSize: 18,
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px #bae6fd',
                      marginBottom: 4
                    }}
                    onClick={handleDownloadCertificate}
                  >
                    Tải chứng chỉ (PDF)
                  </button>
                  <button
                    style={{
                      background: '#fff',
                      color: '#06b6d4',
                      border: '2px solid #06b6d4',
                      borderRadius: 24,
                      padding: '10px 28px',
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: 'pointer',
                      marginBottom: 4
                    }}
                    onClick={handlePreviewCertificate}
                  >
                    Xem trước chứng chỉ
                  </button>
                </div>
              ) : null}
              {previewUrl && (
                <iframe
                  src={previewUrl}
                  title="Xem trước chứng chỉ"
                  width="100%"
                  height={400}
                  style={{ border: '1px solid #ccc', borderRadius: 8, marginTop: 12 }}
                />
              )}
            </div>
          ) : (
            <button
              style={{
                background: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 24,
                padding: '12px 32px',
                fontWeight: 700,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 4px 16px #bae6fd',
                marginBottom: 8,
                opacity: isLoadingCertificate ? 0.7 : 1,
              }}
              disabled={isLoadingCertificate}
              onClick={onIssueCertificate}
            >
              {isLoadingCertificate ? 'Đang cấp chứng chỉ...' : 'Nhận chứng chỉ'}
            </button>
          )}
        </div>
      )}
    </Card>
  );
};

export default SectionSidebar;
