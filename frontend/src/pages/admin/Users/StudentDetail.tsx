import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Typography, Descriptions, Table, Tag } from 'antd'; // Import Table và Tag
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// Định nghĩa kiểu dữ liệu cho một Khóa học
interface Course {
  courseId: string;
  courseName: string;
  enrollmentDate: string; // Ngày đăng ký khóa học
  status: 'Đã hoàn thành' | 'Đang học' | 'Chưa bắt đầu'; // Trạng thái khóa học
  progress?: number; // Tùy chọn: Tiến độ học (ví dụ: 0-100%)
}

// Mở rộng interface User để bao gồm coursesEnrolled
interface User {
  key: string;
  avatarUrl: string;
  name: string;
  email: string;
  phoneNumber: string;
  dob?: string;
  address?: string;
  coursesEnrolled: Course[]; // Thêm trường này
}

// Mock dữ liệu người dùng với các khóa học đã đăng ký
const mockUsers: User[] = [
  {
    key: '1',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=DP',
    name: 'Dương Đức Phương',
    email: 'phuongddph40819@fpt.edu.vn',
    phoneNumber: '0354179061',
    dob: '10/05/2000',
    address: 'Hà Nội, Việt Nam',
    coursesEnrolled: [
      {
        courseId: 'C001',
        courseName: 'Node & ExpressJS Nâng Cao',
        enrollmentDate: '2024-03-15',
        status: 'Đang học',
        progress: 60,
      },
      {
        courseId: 'C002',
        courseName: 'HTML CSS từ Zero đến Hero',
        enrollmentDate: '2024-01-20',
        status: 'Đã hoàn thành',
        progress: 100,
      },
      {
        courseId: 'C005',
        courseName: 'Lập trình Python cơ bản',
        enrollmentDate: '2024-04-01',
        status: 'Chưa bắt đầu',
        progress: 0,
      },
    ],
  },
  {
    key: '2',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=NM',
    name: 'Nguyễn Quang Minh',
    email: 'minhdaoho@gmail.com',
    phoneNumber: 'N/A',
    dob: '15/03/1999',
    address: 'TP. Hồ Chí Minh, Việt Nam',
    coursesEnrolled: [
      {
        courseId: 'C003',
        courseName: 'Kiến Thức Môn IT',
        enrollmentDate: '2024-05-10',
        status: 'Đang học',
        progress: 30,
      },
    ],
  },
  {
    key: '3',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=TK',
    name: 'Trần Đức Khoa',
    email: 'khoatdph50040@gmail.com',
    phoneNumber: 'N/A',
    dob: '20/07/2001',
    address: 'Đà Nẵng, Việt Nam',
    coursesEnrolled: [], // Người dùng này chưa đăng ký khóa học nào
  },
  {
    key: '4',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=TH',
    name: 'Nguyễn Trung Hiếu',
    email: 'nguyenthieu11a7@gmail.com',
    phoneNumber: 'N/A',
    coursesEnrolled: [
      {
        courseId: 'C004',
        courseName: 'JavaScript Nâng Cao',
        enrollmentDate: '2023-11-01',
        status: 'Đã hoàn thành',
        progress: 100,
      },
    ],
  },
  {
    key: '5',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=DB',
    name: 'Đỗ Xuân Bắc',
    email: 'thanhnha041225@gmail.com',
    phoneNumber: 'N/A',
    coursesEnrolled: [],
  },
  {
    key: '6',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=VV',
    name: 'Nguyễn Văn V',
    email: 'nguyenvana@gmail.com',
    phoneNumber: '0912345678',
    coursesEnrolled: [
      {
        courseId: 'C006',
        courseName: 'Xây dựng Website với React',
        enrollmentDate: '2024-02-28',
        status: 'Đang học',
        progress: 85,
      },
    ],
  },
  {
    key: '7',
    avatarUrl: 'https://via.placeholder.com/100/ADD8E6/00008B?text=TL',
    name: 'Lê Thị L',
    email: 'lethil@gmail.com',
    phoneNumber: 'N/A',
    coursesEnrolled: [],
  },
];

const StudentDetail: React.FC = () => {
  interface StudentDetailParams {
    id: string;
  }
  const { id } = useParams<keyof StudentDetailParams>() as StudentDetailParams;

  const user: User | undefined = mockUsers.find((user) => user.key === id);

  // Định nghĩa cột cho bảng Khóa học đã đăng ký
  const coursesColumns = [
    {
      title: <span className="tw-font-bold tw-text-gray-700">Mã Khóa Học</span>,
      dataIndex: 'courseId',
      key: 'courseId',
      onCell: () => ({ className: 'tw-font-medium' }),
    },
    {
      title: <span className="tw-font-bold tw-text-gray-700">Tên Khóa Học</span>,
      dataIndex: 'courseName',
      key: 'courseName',
      onCell: () => ({ className: 'tw-font-medium' }),
    },
    {
      title: <span className="tw-font-bold tw-text-gray-700">Ngày Đăng Ký</span>,
      dataIndex: 'enrollmentDate',
      key: 'enrollmentDate',
    },
    {
      title: <span className="tw-font-bold tw-text-gray-700">Trạng Thái</span>,
      dataIndex: 'status',
      key: 'status',
      render: (status: Course['status']) => {
        let color = 'geekblue';
        if (status === 'Đã hoàn thành') {
          color = 'green';
        } else if (status === 'Đang học') {
          color = 'processing'; // Ant Design predefined status color
        } else if (status === 'Chưa bắt đầu') {
          color = 'default';
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
        title: <span className="tw-font-bold tw-text-gray-700">Tiến độ</span>,
        dataIndex: 'progress',
        key: 'progress',
        render: (progress?: number) => (
            progress !== undefined ? `${progress}%` : 'N/A'
        ),
    },
  ];

  if (!user) {
    return (
      <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen tw-text-center">
        <Title level={4} type="danger">Không tìm thấy người dùng!</Title>
        <Link to="/admin/users/student">
          <Button type="primary" icon={<ArrowLeftOutlined />}>Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="tw-p-6 tw-bg-white tw-rounded-xl tw-shadow-sm tw-min-h-screen">
      {/* Breadcrumb */}
      <div className="tw-mb-6 tw-text-gray-500 tw-text-sm">
        <Link to="/" className="tw-text-blue-600 hover:tw-text-blue-800">Home</Link> /
        <Link to="/admin" className="tw-text-blue-600 hover:tw-text-blue-800"> Admin</Link> /
        <Link to="/admin/users/student" className="tw-text-blue-600 hover:tw-text-blue-800"> Student-list</Link> /
        <span className="tw-font-medium tw-text-gray-700"> Chi tiết người dùng: {user.name}</span>
      </div>

      <div className="tw-flex tw-justify-between tw-items-center tw-mb-6">
        <Title level={2} className="tw-font-bold tw-text-gray-800 tw-mb-0">Chi tiết Người dùng</Title>
        <Link to="/admin/users/student">
          <Button type="default" icon={<ArrowLeftOutlined />} className="tw-rounded-md">
            Quay lại Danh sách
          </Button>
        </Link>
      </div>

      <Card className="tw-shadow-md tw-mb-6"> {/* Thêm margin-bottom */}
        <div className="tw-flex tw-items-center tw-mb-6">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="tw-w-24 tw-h-24 tw-rounded-full tw-object-cover tw-mr-6 tw-border tw-border-gray-200"
          />
          <div>
            <Title level={3} className="tw-mb-1">{user.name}</Title>
            <Text type="secondary">{user.email}</Text>
          </div>
        </div>

        <Descriptions title="Thông tin cá nhân" bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
          <Descriptions.Item label="ID Người dùng">{user.key}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">{user.phoneNumber}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{user.dob || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{user.address || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Phần Khóa học đã đăng ký */}
      <Card title={<span className="tw-font-bold tw-text-gray-800">Khóa học đã đăng ký</span>} className="tw-shadow-md">
        {user.coursesEnrolled && user.coursesEnrolled.length > 0 ? (
          <Table
            columns={coursesColumns}
            dataSource={user.coursesEnrolled.map(course => ({ ...course, key: course.courseId }))} // Gán key cho mỗi hàng
            pagination={false} // Có thể thêm phân trang nếu danh sách khóa học dài
            rowClassName={() => 'tw-h-14'}
            className="tw-border tw-border-gray-200 tw-rounded-lg"
            scroll={{ x: 'max-content' }} // Đảm bảo bảng cuộn nếu nội dung quá dài
          />
        ) : (
          <p className="tw-text-gray-600 tw-text-center tw-py-4">Người dùng này chưa đăng ký khóa học nào.</p>
        )}
      </Card>
    </div>
  );
};

export default StudentDetail;