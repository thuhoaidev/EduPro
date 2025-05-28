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
      {
            id: '3',
            name: 'Lê Văn C',
            email: 'c@example.com',
            degree: 'Cử nhân Kinh tế',
            status: 'Pending',
      },
      {
            id: '4',
            name: 'Phạm Thị D',
            email: 'd@example.com',
            degree: 'Thạc sĩ Quản trị kinh doanh',
            status: 'Pending',
      },
      {
            id: '5',
            name: 'Hoàng Văn E',
            email: 'e@example.com',
            degree: 'Tiến sĩ Vật lý',
            status: 'Pending',
      },
      {
            id: '6',
            name: 'Ngô Thị F',
            email: 'f@example.com',
            degree: 'Cử nhân Luật',
            status: 'Pending',
      },
      {
            id: '7',
            name: 'Đặng Văn G',
            email: 'g@example.com',
            degree: 'Thạc sĩ Xây dựng',
            status: 'Pending',
      },
      {
            id: '8',
            name: 'Trịnh Thị H',
            email: 'h@example.com',
            degree: 'Tiến sĩ Sinh học',
            status: 'Pending',
      }, {
            id: '9',
            name: 'Phan Thị I',
            email: 'i@example.com',
            degree: 'Thạc sĩ Marketing',
            status: 'Pending',
      },
      {
            id: '10',
            name: 'Bùi Văn K',
            email: 'k@example.com',
            degree: 'Tiến sĩ Lịch sử',
            status: 'Pending',
      },
      {
            id: '11',
            name: 'Đỗ Thị L',
            email: 'l@example.com',
            degree: 'Cử nhân Ngoại ngữ',
            status: 'Pending',
      },
      {
            id: '12',
            name: 'Lý Văn M',
            email: 'm@example.com',
            degree: 'Thạc sĩ Tài chính',
            status: 'Pending',
      },
      {
            id: '13',
            name: 'Trương Thị N',
            email: 'n@example.com',
            degree: 'Tiến sĩ Sinh học',
            status: 'Pending',
      },
      {
            id: '14',
            name: 'Vũ Văn O',
            email: 'o@example.com',
            degree: 'Cử nhân Khoa học Máy tính',
            status: 'Pending',
      },
      {
            id: '15',
            name: 'Phạm Thị P',
            email: 'p@example.com',
            degree: 'Thạc sĩ Ngôn ngữ học',
            status: 'Pending',
      },
      {
            id: '16',
            name: 'Hoàng Văn Q',
            email: 'q@example.com',
            degree: 'Tiến sĩ Khoa học Tự nhiên',
            status: 'Pending',
      },
      {
            id: '17',
            name: 'Nguyễn Thị R',
            email: 'r@example.com',
            degree: 'Cử nhân Kinh tế',
            status: 'Pending',
      },
      {
            id: '18',
            name: 'Đinh Văn S',
            email: 's@example.com',
            degree: 'Thạc sĩ Luật',
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
                  navigate('/admin/instructors-approval');
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
