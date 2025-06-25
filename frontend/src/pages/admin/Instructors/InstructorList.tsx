import { useState } from "react";
import {
  Table,
  Input,
  Tag,
  Avatar,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  DatePicker,
  Select,
  Descriptions,
  Divider,
  Typography,
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { UserStatus, type User } from "../../../interfaces/Admin.interface";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import styles from "../Users/UserPage.module.css";
import type { TablePaginationConfig } from 'antd/es/table';

dayjs.locale("vi");

const { RangePicker } = DatePicker;
const { Paragraph, Link: AntdLink } = Typography;

// Extend User with instructor-specific fields
interface CertificateFile {
  name: string;
  url: string;
}
interface Instructor extends User {
  degree: string;
  university: string;
  major: string;
  graduationYear: number;
  expertise: string[];
  experienceYears: number;
  experienceDescription: string;
  cvUrl: string;
  certificates: CertificateFile[];
  demoVideoUrl: string;
  bio: string;
  github: string;
  facebook: string;
  website: string;
  applicationDate: string;
  password: string;
}

// --- Helper Components ---

const StatCards = ({ stats }: { stats: { total: number; active: number; inactive: number } }) => (
  <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
    <Col xs={24} sm={12} md={8}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Tổng số giảng viên"
          value={stats.total}
          prefix={<TeamOutlined className={styles.statIcon} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={8}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Đang hoạt động"
          value={stats.active}
          prefix={<UserSwitchOutlined className={styles.statIcon} style={{ color: "#52c41a" }} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={8}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Không hoạt động"
          value={stats.inactive}
          prefix={<CloseCircleOutlined className={styles.statIcon} style={{ color: "#ff4d4f" }} />}
        />
      </Card>
    </Col>
  </Row>
);

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedStatus,
  setSelectedStatus,
  setDateRange,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedStatus: UserStatus | undefined;
  setSelectedStatus: (status: UserStatus | undefined) => void;
  setDateRange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
}) => (
  <div className={styles.filterGroup}>
    <Input
      placeholder="Tìm kiếm theo tên, email..."
      prefix={<SearchOutlined />}
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      onPressEnter={() => setSearch(searchInput)}
      className={styles.filterInput}
      allowClear
    />
    <Select
      placeholder="Lọc theo trạng thái"
      value={selectedStatus}
      onChange={setSelectedStatus}
      className={styles.filterSelect}
      allowClear
    >
      <Select.Option value={UserStatus.ACTIVE}>Hoạt động</Select.Option>
      <Select.Option value={UserStatus.INACTIVE}>Không hoạt động</Select.Option>
    </Select>
    <RangePicker
      placeholder={["Từ ngày", "Đến ngày"]}
      onChange={(dates) => setDateRange(dates)}
      className={styles.filterDateRange}
      format="DD/MM/YYYY"
    />
  </div>
);

const mockInstructors: Instructor[] = [
  {
    id: "1",
    fullname: "Nguyễn Văn A",
    email: "a@edu.vn",
    avatar: "https://i.pravatar.cc/150?img=11",
    status: UserStatus.ACTIVE,
    createdAt: dayjs().subtract(10, "day").toISOString(),
    updatedAt: dayjs().subtract(2, "day").toISOString(),
    phone: "0123456789",
    address: "Hà Nội",
    dob: dayjs().subtract(30, "year").toISOString(),
    gender: "Nam",
    role: "instructor",
    degree: "Tiến sĩ",
    university: "Đại học Bách Khoa Hà Nội",
    major: "Khoa học máy tính",
    graduationYear: 2018,
    expertise: ["React", "NodeJS", "SQL"],
    experienceYears: 7,
    experienceDescription: "Đã giảng dạy các khóa lập trình web, phát triển ứng dụng React và NodeJS tại nhiều trung tâm lớn. Tham gia xây dựng giáo trình và mentor cho nhiều dự án thực tế.",
    cvUrl: "https://example.com/cv-nguyenvana.pdf",
    certificates: [
      { name: "Chứng chỉ AWS", url: "https://example.com/aws-cert.pdf" },
      { name: "Chứng chỉ React", url: "https://example.com/react-cert.jpg" },
    ],
    demoVideoUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
    bio: "Tôi là tiến sĩ chuyên ngành Khoa học máy tính, đam mê giảng dạy và phát triển phần mềm.",
    github: "https://github.com/nguyenvana",
    facebook: "https://facebook.com/nguyenvana",
    website: "https://nguyenvana.dev",
    applicationDate: dayjs().subtract(12, "day").toISOString(),
    password: "12345678",
  },
  {
    id: "2",
    fullname: "Trần Thị B",
    email: "b@edu.vn",
    avatar: "https://i.pravatar.cc/150?img=12",
    status: UserStatus.INACTIVE,
    createdAt: dayjs().subtract(20, "day").toISOString(),
    updatedAt: dayjs().subtract(5, "day").toISOString(),
    phone: "0987654321",
    address: "TP.HCM",
    dob: dayjs().subtract(28, "year").toISOString(),
    gender: "Nữ",
    role: "instructor",
    degree: "Thạc sĩ",
    university: "Đại học Khoa học Tự nhiên TP.HCM",
    major: "Công nghệ thông tin",
    graduationYear: 2016,
    expertise: ["PHP", "SQL"],
    experienceYears: 5,
    experienceDescription: "Giảng dạy các lớp PHP, MySQL, xây dựng hệ thống quản lý dữ liệu cho doanh nghiệp. Có kinh nghiệm làm việc thực tế tại các công ty phần mềm.",
    cvUrl: "https://example.com/cv-tranthib.docx",
    certificates: [
      { name: "Chứng chỉ PHP", url: "https://example.com/php-cert.pdf" },
    ],
    demoVideoUrl: "https://vimeo.com/123456789",
    bio: "Tôi yêu thích chia sẻ kiến thức về lập trình backend và quản trị cơ sở dữ liệu.",
    github: "https://github.com/tranthib",
    facebook: "https://facebook.com/tranthib",
    website: "https://tranthib.com",
    applicationDate: dayjs().subtract(22, "day").toISOString(),
    password: "87654321",
  },
  {
    id: "3",
    fullname: "Lê Văn C",
    email: "c@edu.vn",
    avatar: "https://i.pravatar.cc/150?img=13",
    status: UserStatus.ACTIVE,
    createdAt: dayjs().subtract(5, "day").toISOString(),
    updatedAt: dayjs().subtract(1, "day").toISOString(),
    phone: "0911222333",
    address: "Đà Nẵng",
    dob: dayjs().subtract(35, "year").toISOString(),
    gender: "Nam",
    role: "instructor",
    degree: "Cử nhân",
    university: "Đại học Đà Nẵng",
    major: "Kỹ thuật phần mềm",
    graduationYear: 2012,
    expertise: ["React"],
    experienceYears: 10,
    experienceDescription: "10 năm kinh nghiệm phát triển front-end, từng làm leader tại nhiều dự án lớn.",
    cvUrl: "https://example.com/cv-levanc.pdf",
    certificates: [],
    demoVideoUrl: "",
    bio: "Luôn cập nhật công nghệ mới và truyền cảm hứng học tập cho học viên.",
    github: "",
    facebook: "",
    website: "",
    applicationDate: dayjs().subtract(6, "day").toISOString(),
    password: "password123",
  },
];

const InstructorList = () => {
  const [instructors] = useState<Instructor[]>(mockInstructors);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState<Instructor | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: mockInstructors.length,
  });
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Filter logic (mock)
  const filteredInstructors = instructors.filter((inst) => {
    const matchesSearch =
      !search ||
      inst.fullname.toLowerCase().includes(search.toLowerCase()) ||
      inst.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      !selectedStatus || inst.status === selectedStatus;
    const matchesDate =
      !dateRange ||
      (!dateRange[0] || dayjs(inst.createdAt).isAfter(dateRange[0].startOf("day"))) &&
      (!dateRange[1] || dayjs(inst.createdAt).isBefore(dateRange[1].endOf("day")));
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Stats
  const stats = {
    total: filteredInstructors.length,
    active: filteredInstructors.filter((u) => u.status === UserStatus.ACTIVE).length,
    inactive: filteredInstructors.filter((u) => u.status === UserStatus.INACTIVE).length,
  };

  // Handlers
  const handleViewDetails = (inst: Instructor) => {
    setViewingInstructor(inst);
    setIsDetailsModalVisible(true);
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination((prev) => ({ ...prev, current: pag.current || 1, pageSize: pag.pageSize || 10 }));
  };

  // Status tag
  const getStatusTag = (status: UserStatus) => {
    const statusMap = {
      [UserStatus.ACTIVE]: { color: "success", label: "Hoạt động", icon: <CheckCircleOutlined /> },
      [UserStatus.INACTIVE]: { color: "default", label: "Không hoạt động", icon: <ClockCircleOutlined /> },
    };
    const tag = statusMap[status] || { color: "default", label: status, icon: null };
    return (
      <Tag color={tag.color} icon={tag.icon} className={styles.statusTag}>
        {tag.label}
      </Tag>
    );
  };

  return (
    <div className={styles.userPageContainer}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Quản lý giảng viên</h2>
          <p className="text-gray-500 mt-1">Quản lý và theo dõi thông tin giảng viên</p>
        </div>
      </div>
      <StatCards stats={stats} />
      <FilterSection
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        setDateRange={setDateRange}
      />
      <Card className={styles.userTableCard}>
        <Table
          rowKey="id"
          dataSource={filteredInstructors.map((u, idx) => ({ ...u, number: idx + 1 })) as Instructor[]}
          pagination={pagination}
          onChange={handleTableChange}
          className={styles.userTable}
          scroll={{ x: true }}
          title={() => (
            <div className={styles.tableHeader}>
              <h4 className={styles.tableTitle}>Danh sách giảng viên</h4>
            </div>
          )}
          onRow={(record) => {
            return {
              onClick: () => {
                handleViewDetails(record as Instructor);
              },
              style: { cursor: "pointer" },
            };
          }}
          columns={[
            {
              title: "STT",
              dataIndex: "number",
              width: 70,
            },
            {
              title: "Giảng viên",
              dataIndex: "fullname",
              render: (_: unknown, record: Instructor) => (
                <div className={styles.avatarCell}>
                  <Avatar src={record.avatar} icon={<UserOutlined />} />
                  <div>
                    <div className={styles.userName}>{record.fullname}</div>
                    <div className={styles.userEmail}>{record.email}</div>
                  </div>
                </div>
              ),
            },
            {
              title: "Trạng thái",
              dataIndex: "status",
              render: (status: UserStatus) => getStatusTag(status),
              width: 150,
            },
            {
              title: "Ngày tạo",
              dataIndex: "createdAt",
              render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
              width: 150,
            },
          ]}
        />
      </Card>
      <Modal
        title="Chi tiết giảng viên"
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={800}
        destroyOnHidden
        className={styles.userDetailModal}
      >
        {viewingInstructor && (
          <div className={styles.userDetailWrapper}>
            <div className={styles.userDetailHeaderBox}>
              <Avatar size={96} src={viewingInstructor.avatar} className={styles.userDetailAvatar} />
              <div className={styles.userDetailHeaderInfo}>
                <div className={styles.userDetailName}>{viewingInstructor.fullname}</div>
                <div className={styles.userDetailEmail}>{viewingInstructor.email}</div>
              </div>
            </div>
            <Divider orientation="left">Thông tin cá nhân</Divider>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Họ và tên">{viewingInstructor.fullname}</Descriptions.Item>
              <Descriptions.Item label="Email">{viewingInstructor.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{viewingInstructor.phone || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Giới tính">{viewingInstructor.gender || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">{viewingInstructor.dob ? dayjs(viewingInstructor.dob).format("DD/MM/YYYY") : "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{viewingInstructor.address || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Mật khẩu">{viewingInstructor.password ? <span style={{ fontFamily: 'monospace' }}>{viewingInstructor.password}</span> : "Chưa cập nhật"}</Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Học vấn & Chuyên môn</Divider>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Bằng cấp">{viewingInstructor.degree}</Descriptions.Item>
              <Descriptions.Item label="Trường đào tạo">{viewingInstructor.university}</Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành">{viewingInstructor.major}</Descriptions.Item>
              <Descriptions.Item label="Năm tốt nghiệp">{viewingInstructor.graduationYear}</Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực chuyên môn">
                {viewingInstructor.expertise && viewingInstructor.expertise.length > 0 ? viewingInstructor.expertise.map((exp) => <Tag key={exp}>{exp}</Tag>) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Số năm kinh nghiệm">{viewingInstructor.experienceYears}</Descriptions.Item>
              <Descriptions.Item label="Mô tả kinh nghiệm" span={2}>
                <Paragraph style={{ marginBottom: 0 }}>{viewingInstructor.experienceDescription}</Paragraph>
              </Descriptions.Item>
            </Descriptions>
            <Divider orientation="left">Hồ sơ & Tài liệu</Divider>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="CV">
                {viewingInstructor.cvUrl ? (
                  <AntdLink href={viewingInstructor.cvUrl} target="_blank" rel="noopener noreferrer">Tải CV</AntdLink>
                ) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Chứng chỉ">
                {viewingInstructor.certificates && viewingInstructor.certificates.length > 0 ? (
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {viewingInstructor.certificates.map((cert) => (
                      <li key={cert.url}>
                        <AntdLink href={cert.url} target="_blank" rel="noopener noreferrer">{cert.name}</AntdLink>
                      </li>
                    ))}
                  </ul>
                ) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Video demo" span={2}>
                {viewingInstructor.demoVideoUrl ? (
                  <div style={{ maxWidth: 400 }}>
                    {viewingInstructor.demoVideoUrl.includes("youtube") || viewingInstructor.demoVideoUrl.includes("youtu.be") ? (
                      <iframe
                        width="100%"
                        height="220"
                        src={viewingInstructor.demoVideoUrl.replace("watch?v=", "embed/")}
                        title="Demo Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : viewingInstructor.demoVideoUrl.includes("vimeo") ? (
                      <iframe
                        src={viewingInstructor.demoVideoUrl.replace("vimeo.com", "player.vimeo.com/video")}
                        width="100%"
                        height="220"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Demo Video"
                      />
                    ) : (
                      <AntdLink href={viewingInstructor.demoVideoUrl} target="_blank" rel="noopener noreferrer">Xem video</AntdLink>
                    )}
                  </div>
                ) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Giới thiệu bản thân" span={2}>
                <Paragraph style={{ marginBottom: 0 }}>{viewingInstructor.bio || "Chưa cập nhật"}</Paragraph>
              </Descriptions.Item>
              {viewingInstructor.github && (
                <Descriptions.Item label="Github">
                  <AntdLink href={viewingInstructor.github} target="_blank" rel="noopener noreferrer">{viewingInstructor.github}</AntdLink>
                </Descriptions.Item>
              )}
              {viewingInstructor.facebook && (
                <Descriptions.Item label="Facebook">
                  <AntdLink href={viewingInstructor.facebook} target="_blank" rel="noopener noreferrer">{viewingInstructor.facebook}</AntdLink>
                </Descriptions.Item>
              )}
              {viewingInstructor.website && (
                <Descriptions.Item label="Website">
                  <AntdLink href={viewingInstructor.website} target="_blank" rel="noopener noreferrer">{viewingInstructor.website}</AntdLink>
                </Descriptions.Item>
              )}
            </Descriptions>
            <Divider orientation="left">Ngày gửi hồ sơ</Divider>
            <Paragraph>{viewingInstructor.applicationDate ? dayjs(viewingInstructor.applicationDate).format("DD/MM/YYYY HH:mm") : "Chưa cập nhật"}</Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InstructorList;
