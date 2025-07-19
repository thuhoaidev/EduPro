import React, { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Select, Spin, Upload, message, Form, Row, Col, Space, Tag, Tooltip, Badge, Collapse, Popconfirm } from 'antd';
import { PlayCircleOutlined, UploadOutlined, VideoCameraOutlined, FileOutlined, EyeOutlined, PlusOutlined, CaretRightOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface Course {
  _id: string;
  title: string;
}
interface Section {
  _id: string;
  title: string;
  lessons: Lesson[];
}
interface Lesson {
  _id: string;
  title: string;
  video?: {
    _id: string;
    url: string;
    duration: number;
  };
  section_id?: string;
}

interface UploadVideoRow {
  _id: string;
  url: string;
  duration: number;
  lessonTitle: string;
  sectionTitle: string;
  courseId: string | null;
  videoId?: string;
}

const VideoManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoList, setVideoList] = useState<UploadVideoRow[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm();
  const [videoFile, setVideoFile] = useState<UploadFile[]>([]);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([]);

  // Thêm state cho modal sửa video
  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false);
  const [editVideoForm] = Form.useForm();
  const [editingVideo, setEditingVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<UploadVideoRow | null>(null);
  const [editVideoFile, setEditVideoFile] = useState<UploadFile[]>([]);
  const [editVideoDuration, setEditVideoDuration] = useState<number>(0);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/courses/instructor`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) setCourses(data.data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    const fetchSections = async () => {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
        // Log thông tin chi tiết về course, section, lesson, video
        console.log('Thông tin khóa học:', courses.find(c => c._id === selectedCourse));
        console.log('Danh sách chương:', data.data.map((s: Section) => ({ _id: s._id, title: s.title })));
        data.data.forEach((section: Section) => {
          console.log(`Chương: ${section.title}`);
          section.lessons.forEach((lesson: Lesson) => {
            console.log('  Bài học:', lesson.title, '| ID:', lesson._id, '| Video:', lesson.video ? lesson.video.url : 'Chưa có video', '| Duration:', lesson.video ? lesson.video.duration : '-');
          });
        });
      }
      setLoading(false);
    };
    fetchSections();
  }, [selectedCourse]);

  // Gộp tất cả bài học và video từ các section
  useEffect(() => {
    const rows: UploadVideoRow[] = [];
    sections.forEach(section => {
      section.lessons.forEach(lesson => {
        rows.push({
          _id: lesson._id,
          url: lesson.video?.url || '',
          duration: lesson.video?.duration || 0,
          lessonTitle: lesson.title,
          sectionTitle: section.title,
          courseId: selectedCourse,
          videoId: lesson.video?._id,
        });
      });
    });
    // Lọc theo selectedSection và selectedLesson nếu có
    let filtered = rows;
    if (selectedSection) {
      filtered = filtered.filter(row => row.sectionTitle === (sections.find(s => s._id === selectedSection)?.title));
    }
    if (selectedLesson) {
      filtered = filtered.filter(row => row._id === selectedLesson);
    }
    setVideoList(filtered);
  }, [sections, selectedCourse, selectedSection, selectedLesson]);

  // Lấy danh sách section và lesson sau khi chọn course
  const sectionOptions = sections.map(s => ({ label: s.title, value: s._id }));
  // lessonOptions: thêm video vào option để dùng cho kiểm tra
  const lessonOptions = selectedSection
    ? (sections.find(s => s._id === selectedSection)?.lessons || []).map(l => ({ label: l.title, value: l._id, video: l.video }))
    : [];

  // Upload video handler (submit form)
  const handleFormFinish = async () => {
    if (!selectedLesson || !videoFile.length || !videoFile[0].originFileObj) {
      message.error('Vui lòng chọn bài học và file video!');
      return;
    }
    setUploading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const formData = new FormData();
      formData.append('video', videoFile[0].originFileObj as File);
      formData.append('lesson_id', selectedLesson);
      formData.append('duration', videoDuration.toString());
      const res = await fetch(`${apiUrl}/videos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        message.success('Tải video lên thành công!');
        // Reload lại sections để cập nhật UI
        const resSec = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const dataSec = await resSec.json();
        if (dataSec.success) setSections(dataSec.data);
        setVideoFile([]);
        setVideoDuration(0);
        form.resetFields();
      } else {
        message.error(data.message || 'Lỗi upload video');
      }
    } catch {
      message.error('Lỗi upload video');
    } finally {
      setUploading(false);
    }
  };

  // Khi chọn file video, lấy duration
  const handleVideoChange = (info: { fileList: UploadFile[] }) => {
    const fileList = info.fileList.slice(-1);
    setVideoFile(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj as File;
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setVideoDuration(Math.round(video.duration));
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setVideoDuration(0);
    }
  };

  // Khi chọn file video cho edit, lấy duration
  const handleEditVideoChange = (info: { fileList: UploadFile[] }) => {
    const fileList = info.fileList.slice(-1);
    setEditVideoFile(fileList);
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const file = fileList[0].originFileObj as File;
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        setEditVideoDuration(Math.round(video.duration));
        window.URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    } else {
      setEditVideoDuration(currentVideo?.duration || 0);
    }
  };

  // Format duration từ giây sang phút:giây
  const formatDuration = (seconds: number) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Hàm mở modal sửa video
  const handleEditVideo = (video: UploadVideoRow) => {
    setCurrentVideo(video);
    editVideoForm.resetFields();
    setEditVideoFile([]);
    setEditVideoDuration(video.duration);
    setIsEditVideoModalOpen(true);
  };

  // Hàm đóng modal sửa video
  const handleCancelEditVideo = () => {
    setIsEditVideoModalOpen(false);
    editVideoForm.resetFields();
    setEditVideoFile([]);
    setEditVideoDuration(0);
    setCurrentVideo(null);
  };

  // Hàm sửa video
  const handleSubmitEditVideo = async () => {
    if (!currentVideo?.videoId) return;

    try {
      setEditingVideo(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const formData = new FormData();
      
      // Nếu có file video mới
      if (editVideoFile.length > 0 && editVideoFile[0].originFileObj) {
        formData.append('video', editVideoFile[0].originFileObj as File);
      }
      
      formData.append('duration', editVideoDuration.toString());

      const response = await fetch(`${apiUrl}/videos/${currentVideo.videoId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật video');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Cập nhật video thành công!');
        setIsEditVideoModalOpen(false);
        editVideoForm.resetFields();
        setEditVideoFile([]);
        setEditVideoDuration(0);
        setCurrentVideo(null);
        
        // Refresh lại danh sách chương để hiển thị video đã cập nhật
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể cập nhật video');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật video:', error);
      message.error(error instanceof Error ? error.message : 'Không thể cập nhật video');
    } finally {
      setEditingVideo(false);
    }
  };

  // Hàm xóa video
  const handleDeleteVideo = async (video: UploadVideoRow) => {
    if (!video.videoId) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/videos/${video.videoId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể xóa video');
      }

      const data = await response.json();
      if (data.success) {
        message.success('Xóa video thành công!');
        
        // Refresh lại danh sách chương để hiển thị video đã xóa
        if (selectedCourse) {
          const refreshResponse = await fetch(`${apiUrl}/courses/${selectedCourse}/sections`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.success) {
              setSections(refreshData.data);
            }
          }
        }
      } else {
        throw new Error(data.message || 'Không thể xóa video');
      }
    } catch (error) {
      console.error('Lỗi khi xóa video:', error);
      message.error(error instanceof Error ? error.message : 'Không thể xóa video');
    }
  };

  // Thống kê
  const totalLessons = videoList.length;
  const lessonsWithVideo = videoList.filter(v => v.url).length;
  const lessonsWithoutVideo = totalLessons - lessonsWithVideo;

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '32px' }}>
          <Title level={2} style={{ margin: 0, color: '#1890ff', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <VideoCameraOutlined />
            Quản lý Video
          </Title>
          <Text type="secondary">Quản lý và tải lên video cho các bài học trong khóa học của bạn</Text>
        </div>

        {/* Thống kê */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center', background: '#f0f9ff' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>{totalLessons}</div>
              <Text type="secondary">Tổng bài học</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center', background: '#f6ffed' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>{lessonsWithVideo}</div>
              <Text type="secondary">Đã có video</Text>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center', background: '#fff7e6' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>{lessonsWithoutVideo}</div>
              <Text type="secondary">Chưa có video</Text>
            </Card>
          </Col>
        </Row>

        {/* Bộ lọc */}
        <Card size="small" style={{ marginBottom: '24px', background: '#fafafa' }}>
          <Row gutter={16} align="middle">
            <Col span={8}>
              <Text strong>Khóa học:</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Chọn khóa học"
                value={selectedCourse || undefined}
                onChange={v => {
                  console.log('Chọn khóa học:', v);
                  setSelectedCourse(v);
                  setSelectedSection(null);
                  setSelectedLesson(null);
                  setVideoFile([]);
                  setVideoDuration(0);
                  form.resetFields();
                }}
                options={courses.map(c => ({ label: c.title, value: c._id }))}
                allowClear
                loading={loading}
              />
            </Col>
            <Col span={8}>
              <Text strong>Chương học:</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Chọn chương học"
                value={selectedSection || undefined}
                onChange={v => {
                  setSelectedSection(v);
                  setSelectedLesson(null);
                  setVideoFile([]);
                  setVideoDuration(0);
                  form.resetFields();
                  // Khi chọn chương, chỉ mở chương đó và đóng các chương khác
                  if (v) {
                    setActiveCollapseKeys([v]);
                  } else {
                    setActiveCollapseKeys([]);
                  }
                }}
                options={sectionOptions}
                disabled={!selectedCourse}
                allowClear
              />
            </Col>
            <Col span={8}>
              <Text strong>Bài học:</Text>
              <Select
                style={{ width: '100%', marginTop: '8px' }}
                placeholder="Chọn bài học"
                value={selectedLesson || undefined}
                onChange={v => {
                  setSelectedLesson(v);
                  setVideoFile([]);
                  setVideoDuration(0);
                  form.resetFields();
                }}
                options={lessonOptions}
                disabled={!selectedSection}
                allowClear
              />
            </Col>
          </Row>
        </Card>

        {/* Form upload video */}
        {selectedLesson && !lessonOptions.find(l => l.value === selectedLesson)?.video && (
          <Card 
            size="small" 
            style={{ marginBottom: '24px', background: '#e6f7ff', border: '1px dashed #91d5ff' }}
            title={
              <Space>
                <UploadOutlined style={{ color: '#1890ff' }} />
                <Text strong style={{ color: '#1890ff' }}>Tải lên video cho bài học</Text>
              </Space>
            }
          >
            <Form
              form={form}
              layout="inline"
              onFinish={handleFormFinish}
              style={{ margin: 0 }}
            >
              <Form.Item
                name="video"
                valuePropName="fileList"
                getValueFromEvent={e => Array.isArray(e) ? e : e && e.fileList}
                rules={[{ required: true, message: 'Vui lòng chọn file video!' }]}
              >
                <Upload
                  beforeUpload={() => false}
                  fileList={videoFile}
                  onChange={handleVideoChange}
                  accept="video/*"
                  maxCount={1}
                  showUploadList={{ showRemoveIcon: true }}
                  disabled={uploading}
                >
                  <Button icon={<UploadOutlined />} disabled={uploading}>
                    Chọn video
                  </Button>
                </Upload>
              </Form.Item>
              <Form.Item label="Thời lượng:">
                <Tag color="blue">{formatDuration(videoDuration)}</Tag>
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={uploading} 
                  disabled={!videoFile.length || !videoDuration}
                  icon={<PlusOutlined />}
                >
                  Tải video lên
                </Button>
              </Form.Item>
            </Form>
          </Card>
        )}

        {/* Bảng danh sách video */}
        <Card 
          title={
            <Space>
              <FileOutlined />
              <Text strong>Danh sách bài học và video</Text>
            </Space>
          }
          extra={
            <Space>
              <Badge count={lessonsWithVideo} style={{ backgroundColor: '#52c41a' }}>
                <Tag color="success">Có video</Tag>
              </Badge>
              <Badge count={lessonsWithoutVideo} style={{ backgroundColor: '#fa8c16' }}>
                <Tag color="warning">Chưa có video</Tag>
              </Badge>
            </Space>
          }
        >
          <Spin spinning={loading}>
            {sections.length > 0 ? (
              <Collapse 
                activeKey={activeCollapseKeys}
                onChange={(keys) => setActiveCollapseKeys(Array.isArray(keys) ? keys : [keys])}
                expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
                style={{ background: 'transparent' }}
              >
                {sections.map(section => {
                  const sectionLessons = section.lessons.filter(lesson => {
                    if (selectedSection && selectedSection !== section._id) return false;
                    if (selectedLesson && selectedLesson !== lesson._id) return false;
                    return true;
                  });

                  const sectionLessonsWithVideo = sectionLessons.filter(l => l.video?.url).length;
                  const sectionLessonsWithoutVideo = sectionLessons.length - sectionLessonsWithVideo;

                  return (
                    <Panel
                      key={section._id}
                      header={
                        <Space>
                          <Text strong style={{ fontSize: '16px' }}>{section.title}</Text>
                          <Badge count={sectionLessons.length} style={{ backgroundColor: '#1890ff' }}>
                            <Tag color="blue">Bài học</Tag>
                          </Badge>
                          <Badge count={sectionLessonsWithVideo} style={{ backgroundColor: '#52c41a' }}>
                            <Tag color="success">Có video</Tag>
                          </Badge>
                          <Badge count={sectionLessonsWithoutVideo} style={{ backgroundColor: '#fa8c16' }}>
                            <Tag color="warning">Chưa có video</Tag>
                          </Badge>
                        </Space>
                      }
                      style={{ 
                        marginBottom: '8px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '8px'
                      }}
                    >
                      <Table
                        dataSource={sectionLessons.map(lesson => ({
                          _id: lesson._id,
                          url: lesson.video?.url || '',
                          duration: lesson.video?.duration || 0,
                          lessonTitle: lesson.title,
                          sectionTitle: section.title,
                          courseId: selectedCourse,
                          videoId: lesson.video?._id,
                        }))}
                        rowKey="_id"
                        columns={[
                          { 
                            title: 'Tên bài học', 
                            dataIndex: 'lessonTitle',
                            render: (text) => <Text>{text}</Text>
                          },
                          { 
                            title: 'Thời lượng', 
                            dataIndex: 'duration', 
                            render: (v) => v ? <Tag color="blue">{formatDuration(v)}</Tag> : <Text type="secondary">-</Text>,
                            align: 'center'
                          },
                          {
                            title: 'Trạng thái',
                            render: (_, record) => {
                              if (record.url && record.url.startsWith('http')) {
                                return <Tag color="success" icon={<VideoCameraOutlined />}>Đã có video</Tag>;
                              }
                              return <Tag color="warning" icon={<VideoCameraOutlined />}>Chưa có video</Tag>;
                            },
                            align: 'center'
                          },
                          {
                            title: 'Thao tác',
                            render: (_, record) => {
                              const handlePreview = () => {
                                console.log('Preview video url:', record.url);
                                setPreviewUrl(record.url);
                              };
                              return record.url && record.url.startsWith('http') ? (
                                <Space>
                                  <Tooltip title="Xem video">
                                    <Button 
                                      type="primary" 
                                      size="small" 
                                      icon={<EyeOutlined />} 
                                      onClick={handlePreview}
                                    />
                                  </Tooltip>
                                  <Tooltip title="Sửa video">
                                    <Button 
                                      type="default" 
                                      size="small" 
                                      icon={<EditOutlined />} 
                                      onClick={() => handleEditVideo(record)}
                                    />
                                  </Tooltip>
                                  <Popconfirm
                                    title="Xóa video"
                                    description="Bạn có chắc chắn muốn xóa video này không?"
                                    onConfirm={() => handleDeleteVideo(record)}
                                    okText="Có"
                                    cancelText="Không"
                                  >
                                    <Tooltip title="Xóa video">
                                      <Button 
                                        type="text" 
                                        size="small" 
                                        danger
                                        icon={<DeleteOutlined />} 
                                      />
                                    </Tooltip>
                                  </Popconfirm>
                                </Space>
                              ) : (
                                <Tooltip title="Thêm video">
                                  <Button 
                                    type="primary" 
                                    size="small" 
                                    icon={<PlusOutlined />} 
                                    onClick={() => {
                                      setSelectedLesson(record._id);
                                      setVideoFile([]);
                                      setVideoDuration(0);
                                      form.resetFields();
                                    }}
                                  />
                                </Tooltip>
                              );
                            },
                            align: 'center'
                          },
                        ]}
                        pagination={false}
                        size="small"
                        rowClassName={(record) => record.url ? 'table-row-success' : 'table-row-warning'}
                        style={{ margin: 0 }}
                      />
                    </Panel>
                  );
                })}
              </Collapse>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                <FileOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div>Chưa có dữ liệu bài học</div>
                <Text type="secondary">Vui lòng chọn khóa học để xem danh sách bài học</Text>
              </div>
            )}
          </Spin>
        </Card>
      </Card>

      {/* Modal xem video */}
      <Modal
        open={!!previewUrl}
        onCancel={() => setPreviewUrl(null)}
        footer={null}
        title={
          <Space>
            <PlayCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>Xem video</Text>
          </Space>
        }
        width={800}
        destroyOnClose
        centered
      >
        {previewUrl && (
          <div style={{ textAlign: 'center' }}>
            <video 
              src={previewUrl} 
              controls 
              style={{ width: '100%', borderRadius: '8px' }} 
              preload="metadata"
            />
          </div>
        )}
      </Modal>

      {/* Modal sửa video */}
      <Modal
        title="Sửa video"
        open={isEditVideoModalOpen}
        onCancel={handleCancelEditVideo}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={editVideoForm}
          layout="vertical"
          onFinish={handleSubmitEditVideo}
        >
          <Form.Item label="Bài học:">
            <Text strong>{currentVideo?.lessonTitle}</Text>
          </Form.Item>

          <Form.Item label="Video hiện tại:">
            {currentVideo?.url && (
              <video 
                src={currentVideo.url} 
                controls 
                style={{ width: '100%', borderRadius: '8px', maxHeight: '200px' }} 
                preload="metadata"
              />
            )}
          </Form.Item>

          <Form.Item label="Thay thế video (tùy chọn):">
            <Upload
              beforeUpload={() => false}
              fileList={editVideoFile}
              onChange={handleEditVideoChange}
              accept="video/*"
              maxCount={1}
              showUploadList={{ showRemoveIcon: true }}
              disabled={editingVideo}
            >
              <Button icon={<UploadOutlined />} disabled={editingVideo}>
                Chọn video mới
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Thời lượng:">
            <Tag color="blue">{formatDuration(editVideoDuration)}</Tag>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelEditVideo}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={editingVideo}
              >
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .table-row-success {
          background-color: #f6ffed;
        }
        .table-row-warning {
          background-color: #fff7e6;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default VideoManager; 