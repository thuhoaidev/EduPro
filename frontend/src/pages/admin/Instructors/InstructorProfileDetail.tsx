import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
      Card,
      Button,
      message,
      Avatar,
      Badge,
      Descriptions,
      Space,
      Popconfirm,
      Row,
      Col,
      Divider,
      Tag,
      Tooltip,
      Spin
} from 'antd';
import {
      ArrowLeftOutlined,
      UserOutlined,
      MailOutlined,
      PhoneOutlined,
      CalendarOutlined,
      CheckCircleOutlined,
      CloseCircleOutlined,
      ClockCircleOutlined,
      EnvironmentOutlined,
      LinkedinOutlined,
      GithubOutlined,
      BookOutlined
} from '@ant-design/icons';
import { config } from '../../../api/axios';
import type { InstructorApprovalProfile } from '../../../interfaces/Admin.interface';

const TeacherProfileDetail = () => {
      const { id } = useParams<{ id: string }>();
      const navigate = useNavigate();
      const [teacher, setTeacher] = useState<InstructorApprovalProfile | null>(null);
      const [loading, setLoading] = useState(true);
      const [updating, setUpdating] = useState(false);

      useEffect(() => {
            const fetchTeacherProfile = async () => {
                  try {
                        setLoading(true);
                        const response = await config.get(`/admin/users/instructors/${id}`);
                        console.log('API response:', response.data);
                        setTeacher(response.data.data);
                  } catch (error) {
                        console.error('Error fetching teacher profile:', error);
                        message.error('Không thể tải thông tin giảng viên');
                  } finally {
                        setLoading(false);
                  }
            };

            fetchTeacherProfile();
      }, [id]);

      const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
            try {
                  setUpdating(true);
                  await config.put(`/admin/users/instructors/${id}/approval`, {
                        status
                  });
                  message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
                  setTeacher(prev => prev ? { ...prev, approval_status: status } : null);
                  navigate('/admin/instructors');
            } catch (error) {
                  console.error('Error updating teacher status:', error);
                  message.error('Cập nhật trạng thái thất bại');
            } finally {
                  setUpdating(false);
            }
      };

      const getStatusConfig = (status: string) => {
            const config = {
                  approved: { color: 'success' as const, icon: <CheckCircleOutlined />, text: 'Đã duyệt' },
                  rejected: { color: 'error' as const, icon: <CloseCircleOutlined />, text: 'Đã từ chối' },
                  pending: { color: 'warning' as const, icon: <ClockCircleOutlined />, text: 'Chờ duyệt' }
            };
            return config[status as keyof typeof config] || config.pending;
      };

      if (loading) {
            return (
                  <div className="flex justify-center items-center min-h-[60vh]">
                        <Spin size="large" />
                  </div>
            );
      }

      if (!teacher) {
            return (
                  <div className="flex flex-col items-center justify-center min-h-[60vh]">
                        <div className="text-2xl font-semibold text-red-500 mb-4">
                              Không tìm thấy hồ sơ giảng viên
                        </div>
                        <Button type="primary" onClick={() => navigate(-1)}>
                              Quay lại danh sách
                        </Button>
                  </div>
            );
      }

      const statusConfig = getStatusConfig(teacher.approval_status);

      return (
            <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                        <Button
                              type="default"
                              icon={<ArrowLeftOutlined />}
                              onClick={() => navigate(-1)}
                              className="flex items-center"
                        >
                              Quay lại danh sách
                        </Button>
                        <Badge
                              status={statusConfig.color}
                              text={
                                    <span className="text-base font-medium flex items-center gap-2">
                                          {statusConfig.icon}
                                          {statusConfig.text}
                                    </span>
                              }
                        />
                  </div>

                  <Row gutter={[24, 24]}>
                        <Col xs={24}>
                              <Card className="shadow-sm">
                                    <div className="flex flex-col md:flex-row gap-6">
                                          <div className="flex flex-col items-center">
                                                <Avatar
                                                      size={120}
                                                      icon={<UserOutlined />}
                                                      src={teacher.avatar || undefined}
                                                      className="border-4 border-gray-100 shadow-lg"
                                                />

                                                <div className="mt-4 flex gap-2">
                                                      <Tooltip title="Gửi email">
                                                            <Button
                                                                  type="text"
                                                                  icon={<MailOutlined />}
                                                                  href={`mailto:${teacher.email}`}
                                                            />
                                                      </Tooltip>
                                                      <Tooltip title="Gọi điện thoại">
                                                            <Button
                                                                  type="text"
                                                                  icon={<PhoneOutlined />}
                                                                  href={`tel:${teacher.instructorInfo?.phone}`}
                                                            />
                                                      </Tooltip>
                                                      <Tooltip title="LinkedIn">
                                                            <Button type="text" icon={<LinkedinOutlined />} />
                                                      </Tooltip>
                                                      <Tooltip title="GitHub">
                                                            <Button type="text" icon={<GithubOutlined />} />
                                                      </Tooltip>
                                                </div>
                                          </div>

                                          <div className="flex-1">
                                                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                                      {teacher.fullname}
                                                </h1>
                                                <div className="flex items-center gap-2 text-gray-600 mb-4">
                                                      <EnvironmentOutlined />
                                                      <span>Hà Nội, Việt Nam</span>
                                                </div>
                                                <p className="text-gray-600 text-base leading-relaxed">
                                                      {teacher.instructorInfo?.bio}
                                                </p>
                                          </div>
                                    </div>

                                    <Divider />

                                    <Descriptions
                                          column={{ xs: 1, sm: 2 }}
                                          bordered
                                          size="small"
                                          className="bg-white"
                                    >
                                          <Descriptions.Item
                                                label={<span className="flex items-center gap-2"><MailOutlined /> Email</span>}
                                          >
                                                <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:text-blue-800">
                                                      {teacher.email}
                                                </a>
                                          </Descriptions.Item>
                                          <Descriptions.Item
                                                label={<span className="flex items-center gap-2"><PhoneOutlined /> Số điện thoại</span>}
                                          >
                                                <a href={`tel:${teacher.instructorInfo?.phone}`} className="text-blue-600 hover:text-blue-800">
                                                      {teacher.instructorInfo?.phone}
                                                </a>
                                          </Descriptions.Item>
                                          <Descriptions.Item
                                                label={<span className="flex items-center gap-2"><UserOutlined /> Giới tính</span>}
                                          >
                                                {teacher.instructorInfo?.gender || 'Không rõ'}
                                          </Descriptions.Item>
                                          <Descriptions.Item
                                                label={<span className="flex items-center gap-2"><CalendarOutlined /> ID</span>}
                                          >
                                                {teacher._id}
                                          </Descriptions.Item>
                                    </Descriptions>

                                    {teacher.approval_status === 'pending' && (
                                          <div className="mt-6 flex justify-end gap-4">
                                                <Space>
                                                      <Popconfirm
                                                            title="Duyệt hồ sơ"
                                                            description="Bạn có chắc chắn muốn duyệt hồ sơ này?"
                                                            onConfirm={() => handleUpdateStatus('approved')}
                                                            okText="Duyệt"
                                                            cancelText="Hủy"
                                                            okButtonProps={{ type: 'primary' }}
                                                      >
                                                            <Button
                                                                  type="primary"
                                                                  icon={<CheckCircleOutlined />}
                                                                  className="flex items-center"
                                                                  loading={updating}
                                                            >
                                                                  Duyệt hồ sơ
                                                            </Button>
                                                      </Popconfirm>

                                                      <Popconfirm
                                                            title="Từ chối hồ sơ"
                                                            description="Bạn có chắc chắn muốn từ chối hồ sơ này?"
                                                            onConfirm={() => handleUpdateStatus('rejected')}
                                                            okText="Từ chối"
                                                            cancelText="Hủy"
                                                            okButtonProps={{ danger: true }}
                                                      >
                                                            <Button
                                                                  danger
                                                                  icon={<CloseCircleOutlined />}
                                                                  className="flex items-center"
                                                                  loading={updating}
                                                            >
                                                                  Từ chối
                                                            </Button>
                                                      </Popconfirm>
                                                </Space>
                                          </div>
                                    )}
                              </Card>
                        </Col>
                  </Row>

                  <style>{`
        .ant-descriptions-item-label {
          background: #fafafa !important;
          font-weight: 500;
        }
        .ant-timeline-item-content {
          color: #666;
        }
      `}</style>
            </div>
      );
};

export default TeacherProfileDetail;
