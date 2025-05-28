// src/pages/admin/TeachersReviewPage.tsx
import React, { useState } from 'react';
import { Table, Tag, Button, Space, message, Popconfirm, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
interface TeacherProfile {
      id: string;
      name: string;
      email: string;
      degree: string;
      status: 'Pending' | 'Approved' | 'Rejected';
}

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

const InstructorApproval = () => {
      const [data, setData] = useState<TeacherProfile[]>(mockTeachers);
      const [searchText, setSearchText] = useState("");
      const navigate = useNavigate();

      // Lọc theo expertise hoặc bio (ví dụ)
      const filteredData = data.filter(
            (ins) =>
                  ins.name.toLowerCase().includes(searchText.toLowerCase()) ||
                  ins.email.toLowerCase().includes(searchText.toLowerCase()) ||
                  ins.degree.toLowerCase().includes(searchText.toLowerCase())
      );


      const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
            setData(prev =>
                  prev
                        .map(t => (t.id === id ? { ...t, status } : t))
                        .filter(t => t.status === 'Pending') // chỉ giữ hồ sơ đang chờ duyệt
            );
            message.success(`Đã ${status === 'Approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
      };


      const columns: ColumnsType<TeacherProfile> = [
            {
                  title: 'STT',
                  align: 'center',
                  width: 60,
                  render: (_text, _record, index) => index + 1,
            },
            {
                  title: 'Họ tên',
                  align: 'center',
                  dataIndex: 'name',
            },
            {
                  title: 'Email',
                  align: 'center',
                  dataIndex: 'email',
            },
            {
                  title: 'Trình độ',
                  align: 'center',
                  dataIndex: 'degree',
            },
            {
                  title: 'Trạng thái',
                  align: 'center',
                  dataIndex: 'status',
                  render: (status: string) => {
                        const color = status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'orange';
                        return <Tag color={color}>{status}</Tag>;
                  },
            },
            {
                  title: 'Hành động',
                  align: 'center',
                  render: (_: any, record: TeacherProfile) => (
                        <Space>
                              <Popconfirm
                                    title="Bạn có chắc muốn duyệt?"
                                    onConfirm={() => handleUpdateStatus(record.id, 'Approved')}
                                    okText="Duyệt"
                                    cancelText="Hủy"
                              >
                                    <Button type="primary" disabled={record.status !== 'Pending'}>
                                          Duyệt
                                    </Button>
                              </Popconfirm>
                              <Popconfirm
                                    title="Bạn có chắc muốn từ chối?"
                                    onConfirm={() => handleUpdateStatus(record.id, 'Rejected')}
                                    okText="Từ chối"
                                    cancelText="Hủy"
                              >
                                    <Button danger disabled={record.status !== 'Pending'}>
                                          Từ chối
                                    </Button>
                              </Popconfirm>
                              <Button
                                    onClick={() => navigate(`/admin/users/instructor-approval/${record.id}`)}
                              >
                                    Xem chi tiết
                              </Button>
                        </Space>
                  ),
            },
      ];

      return (
            <div style={{ padding: 24 }}>
                  <h2 className="text-xl font-semibold mb-4">Danh sách giảng viên chờ duyệt</h2>
                  <div className="mb-4 flex items-center gap-2">
                        <Input
                              prefix={<SearchOutlined />}
                              placeholder="Tìm theo lĩnh vực hoặc tiểu sử..."
                              style={{ maxWidth: 300 }}
                              value={searchText}
                              onChange={(e) => setSearchText(e.target.value)}
                        />
                  </div>
                  <Table rowKey="id" columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} />

            </div>
      );
}
export default InstructorApproval