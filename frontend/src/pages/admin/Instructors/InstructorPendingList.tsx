import React, { useEffect, useState } from "react";
import { Table, Input, Button, Tag, Space, message, Popconfirm } from "antd";
import type { ColumnsType } from "antd/es/table";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { config } from '../../../api/axios';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  degree: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockTeachers: TeacherProfile[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
    degree: 'Thạc sĩ CNTT',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'b@example.com',
    degree: 'Tiến sĩ Toán',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Lê Văn C',
    email: 'c@example.com',
    degree: 'Thạc sĩ Vật lý',
    status: 'approved',
  },
  {
    id: '4',
    name: 'Phạm Thị D',
    email: 'd@example.com',
    degree: 'Tiến sĩ Hóa học',
    status: 'rejected',
  },
  {
    id: '5',
    name: 'Hoàng Văn E',
    email: 'e@example.com',
    degree: 'Thạc sĩ Khoa học máy tính',
    status: 'pending',
  },
  {
    id: '6',
    name: 'Đặng Thị F',
    email: 'f@example.com',
    degree: 'Tiến sĩ Sinh học',
    status: 'approved',
  },
  {
    id: '7',
    name: 'Ngô Văn G',
    email: 'g@example.com',
    degree: 'Thạc sĩ Kinh tế',
    status: 'pending',
  },
  {
    id: '8',
    name: 'Bùi Thị H',
    email: 'h@example.com',
    degree: 'Tiến sĩ Tài chính',
    status: 'pending',
  },
  {
    id: '9',
    name: 'Trịnh Văn I',
    email: 'i@example.com',
    degree: 'Thạc sĩ Kế toán',
    status: 'rejected',
  },
  {
    id: '10',
    name: 'Dương Thị K',
    email: 'k@example.com',
    degree: 'Tiến sĩ Marketing',
    status: 'approved',
  },
  {
    id: '11',
    name: 'Mai Văn L',
    email: 'l@example.com',
    degree: 'Thạc sĩ Toán học',
    status: 'pending',
  },
  {
    id: '12',
    name: 'Vũ Thị M',
    email: 'm@example.com',
    degree: 'Tiến sĩ CNTT',
    status: 'pending',
  },
  {
    id: '13',
    name: 'Phan Văn N',
    email: 'n@example.com',
    degree: 'Thạc sĩ Công nghệ phần mềm',
    status: 'pending',
  },
  {
    id: '14',
    name: 'Trần Thị O',
    email: 'o@example.com',
    degree: 'Tiến sĩ Giáo dục',
    status: 'rejected',
  },
  {
    id: '15',
    name: 'Lý Văn P',
    email: 'p@example.com',
    degree: 'Thạc sĩ An ninh mạng',
    status: 'approved',
  },
  {
    id: '16',
    name: 'Đỗ Thị Q',
    email: 'q@example.com',
    degree: 'Tiến sĩ Vật lý',
    status: 'pending',
  },
  {
    id: '17',
    name: 'Trịnh Văn R',
    email: 'r@example.com',
    degree: 'Thạc sĩ Hệ thống thông tin',
    status: 'pending',
  },
  {
    id: '18',
    name: 'Nguyễn Thị S',
    email: 's@example.com',
    degree: 'Tiến sĩ Khoa học dữ liệu',
    status: 'pending',
  },
  {
    id: '19',
    name: 'Lê Văn T',
    email: 't@example.com',
    degree: 'Thạc sĩ Công nghệ thông tin',
    status: 'approved',
  },
  {
    id: '20',
    name: 'Hoàng Thị U',
    email: 'u@example.com',
    degree: 'Tiến sĩ Trí tuệ nhân tạo',
    status: 'pending',
  },
  {
    id: '21',
    name: 'Phạm Văn V',
    email: 'v@example.com',
    degree: 'Thạc sĩ Mạng máy tính',
    status: 'rejected',
  },
  {
    id: '22',
    name: 'Bùi Thị X',
    email: 'x@example.com',
    degree: 'Tiến sĩ Phát triển phần mềm',
    status: 'pending',
  }
];



export default function TeachersReviewPage() {
  const [data, setData] = useState<TeacherProfile[]>(mockTeachers);
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  useEffect(() => {
    if (!searchText) {
      // Nếu search trống thì hiện tất cả pending
      setData(mockTeachers.filter(t => t.status === 'pending'));
    } else {
      const filtered = mockTeachers.filter(t =>
        (t.name.toLowerCase().includes(searchText.toLowerCase()) ||
          t.email.toLowerCase().includes(searchText.toLowerCase()) ||
          t.degree.toLowerCase().includes(searchText.toLowerCase())) &&
        t.status === 'pending'
      );
      setData(filtered);
    }
  }, [searchText]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      // await config.patch(`/api/instructors/${id}/status`, { status });

      setData(prev => {
        const updated = prev.map(t =>
          t.id === id ? { ...t, status } : t
        );
        return updated.filter(t => t.status === 'pending');
      });
      const idx = mockTeachers.findIndex(t => t.id === id);
      if (idx >= 0) mockTeachers[idx].status = status;
      message.success(`Đã ${status === 'approved' ? 'duyệt' : 'từ chối'} hồ sơ`);
    } catch (error) {
      console.error(error);
      message.error('Cập nhật trạng thái thất bại');
    }
  };



  const columns: ColumnsType<TeacherProfile> = [
    {
      title: 'Họ tên',
      dataIndex: 'name',
      className: 'text-center',
      align: 'center',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      className: 'text-center',
      align: 'center',
    },
    {
      title: 'Trình độ',
      dataIndex: 'degree',
      className: 'text-center',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      className: 'text-center',
      align: 'center',
      render: (status: string) => {
        const color =
          status === 'approved' ? 'green' : status === 'rejected' ? 'red' : 'orange';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Hành động',
      className: 'text-center',
      align: 'center',
      render: (_, record: TeacherProfile) => (
        <Space>
          <Popconfirm
            title="Bạn có chắc muốn duyệt?"
            onConfirm={() => handleUpdateStatus(record.id, 'approved')}
            okText="Duyệt"
            cancelText="Hủy"
          >
            <Button type="primary" disabled={record.status !== 'pending'}>
              Duyệt
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Bạn có chắc muốn từ chối?"
            onConfirm={() => handleUpdateStatus(record.id, 'rejected')}
            okText="Từ chối"
            cancelText="Hủy"
          >
            <Button danger disabled={record.status !== 'pending'}>
              Từ chối
            </Button>
          </Popconfirm>
          <Button onClick={() => navigate(`/admin/users/instructor-approval/${record.id}`)}>
            Xem chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 className="text-2xl font-bold mb-6">Duyệt hồ sơ giảng viên</h2>
      <div className="mb-4 flex items-center gap-2">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, email,..."
          style={{ maxWidth: 320 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        bordered
        pagination={{ pageSize: 8 }}
      />
    </div>
  );
}
