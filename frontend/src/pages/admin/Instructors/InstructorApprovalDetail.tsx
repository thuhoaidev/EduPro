import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, message, Popconfirm } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

interface TeacherProfile {
      id: string;
      name: string;
      email: string;
      degree: string;
      status: 'Pending' | 'Approved' | 'Rejected';
}

// Giả sử đây là mock data (bạn có thể fetch từ API thực tế)
const mockTeachers: TeacherProfile[] = [
      {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'a@example.com',
            degree: 'Thạc sĩ CNTT',
            status: 'Pending',
      },
      {
            id: '2',
            name: 'Trần Thị B',
            email: 'b@example.com',
            degree: 'Tiến sĩ Toán',
            status: 'Pending',
      },
];

export default function TeacherDetailPage() {
      const { id } = useParams<{ id: string }>();
      const navigate = useNavigate();
      const [teacher, setTeacher] = useState<TeacherProfile | null>(null);

      // Load data giảng viên theo id
      useEffect(() => {
            // TODO: Thay bằng API call thực tế
            const found = mockTeachers.find(t => t.id === id);
            if (!found) {
                  message.error('Không tìm thấy giảng viên');
                  navigate('/admin/teachers-review');
                  return;
            }
            setTeacher(found);
      }, [id, navigate]);

      // Hàm cập nhật trạng thái
      const handleUpdateStatus = (status: 'Approved' | 'Rejected') => {
            if (!teacher) return;
            setTeacher({ ...teacher, status });
            message.success(`Đã ${status === 'Approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
            setTimeout(() => {
                  navigate('/admin/instructors-approval');
            }, 1000);
      };

      if (!teacher) return null;

      return (
            <div >
                  <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        className="mb-4"
                        onClick={() => navigate(-1)}
                  >
                        Quay lại
                  </Button>
                  <Card title="Chi tiết hồ sơ giảng viên" >
                        {/* <Descriptions column={1} bordered>
                              <Descriptions.Item label="Họ tên">{teacher.name}</Descriptions.Item>
                              <Descriptions.Item label="Email">{teacher.email}</Descriptions.Item>
                              <Descriptions.Item label="Trình độ">{teacher.degree}</Descriptions.Item>
                              <Descriptions.Item label="Trạng thái">
                                    <span style={{
                                          color: teacher.status === 'approved' ? 'green' :
                                                teacher.status === 'rejected' ? 'red' : 'orange'
                                    }}>
                                          {teacher.status}
                                    </span>
                              </Descriptions.Item>
                        </Descriptions> */}

                        <Descriptions column={1} bordered>
                              <Descriptions.Item label="Họ tên" labelStyle={{ width: 120 }}
                                    contentStyle={{ textAlign: 'left' }}>{teacher.name}</Descriptions.Item>
                              <Descriptions.Item label="Email" labelStyle={{ width: 120 }}
                                    contentStyle={{ textAlign: 'left' }}>{teacher.email}</Descriptions.Item>
                              <Descriptions.Item label="Trình độ" labelStyle={{ width: 120 }}
                                    contentStyle={{ textAlign: 'left' }}>{teacher.degree}</Descriptions.Item>
                              <Descriptions.Item label="Trạng thái" labelStyle={{ width: 120 }}
                                    contentStyle={{ textAlign: 'left' }}>
                                    <span
                                          style={{
                                                color:
                                                      teacher.status === 'Approved'
                                                            ? 'green'
                                                            : teacher.status === 'Rejected'
                                                                  ? 'red'
                                                                  : 'orange',
                                          }}
                                    >
                                          {teacher.status}
                                    </span>
                              </Descriptions.Item>
                        </Descriptions>
                        <Space style={{ marginTop: 20 }}>
                              <Popconfirm
                                    title="Bạn có chắc muốn duyệt hồ sơ này?"
                                    onConfirm={() => handleUpdateStatus('Approved')}
                                    okText="Duyệt"
                                    cancelText="Hủy"
                                    disabled={teacher.status !== 'Pending'}
                              >
                                    <Button type="primary" disabled={teacher.status !== 'Pending'}>
                                          Duyệt
                                    </Button>
                              </Popconfirm>

                              <Popconfirm
                                    title="Bạn có chắc muốn từ chối hồ sơ này?"
                                    onConfirm={() => handleUpdateStatus('Rejected')}
                                    okText="Từ chối"
                                    cancelText="Hủy"
                                    disabled={teacher.status !== 'Pending'}
                              >
                                    <Button danger disabled={teacher.status !== 'Pending'}>
                                          Từ chối
                                    </Button>
                              </Popconfirm>
                        </Space>
                  </Card>
            </div>
      );
}
