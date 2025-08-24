import { useCallback, useEffect, useState } from "react";
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
  Button,
  message,
  Space,
  Badge,
  Tooltip,
  Progress
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  TrophyOutlined,
  FilterOutlined,
  EyeOutlined,
  MailOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  BookOutlined,
  StarOutlined,
  PhoneOutlined,
  HomeOutlined,
  GiftOutlined,
  ManOutlined
} from "@ant-design/icons";
import { UserStatus, type User } from "../../../interfaces/Admin.interface";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useRef } from "react";
import type { TablePaginationConfig } from 'antd/es/table';
import { config } from "../../../api/axios";
import { motion } from 'framer-motion';

dayjs.locale("vi");

const { Title, Text, Paragraph, Link: AntdLink } = Typography;

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
  approvalStatus: 'pending' | 'approved' | 'rejected';
}

// --- Helper Components ---

const StatCards = ({
  stats,
}: {
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
    <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TeamOutlined style={{ color: '#1890ff', fontSize: '24px' }} />
          </div>
            <div style={{ flex: 1 }}>
            <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Tổng giảng viên</Text>}
              value={stats.total}
                valueStyle={{ color: '#1890ff', fontSize: '28px', fontWeight: 600 }}
            />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>+15% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#f6ffed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
          </div>
            <div style={{ flex: 1 }}>
            <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Đã duyệt</Text>}
              value={stats.approved}
                valueStyle={{ color: '#52c41a', fontSize: '28px', fontWeight: 600 }}
            />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <RiseOutlined style={{ color: '#52c41a' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>+8% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#fff7e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserSwitchOutlined style={{ color: '#faad14', fontSize: '24px' }} />
          </div>
            <div style={{ flex: 1 }}>
            <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Chờ duyệt</Text>}
              value={stats.pending}
                valueStyle={{ color: '#faad14', fontSize: '28px', fontWeight: 600 }}
            />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <RiseOutlined style={{ color: '#faad14' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>+12% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
        <Card 
          style={{ 
            background: 'rgba(255, 255, 255, 0.95)', 
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease'
          }}
          hoverable
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '12px', 
              backgroundColor: '#fff1f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />
          </div>
            <div style={{ flex: 1 }}>
            <Statistic
                title={<Text style={{ fontSize: '14px', color: '#666' }}>Từ chối</Text>}
              value={stats.rejected}
                valueStyle={{ color: '#ff4d4f', fontSize: '28px', fontWeight: 600 }}
            />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <FallOutlined style={{ color: '#ff4d4f' }} />
                <Text type="secondary" style={{ fontSize: '12px' }}>-5% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  </Row>
  </motion.div>
);

const FilterSection = ({
  searchInput,
  setSearchInput,
  setSearch,
  selectedApprovalStatus,
  setSelectedApprovalStatus,
  setDateRange,
}: {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSearch: (value: string) => void;
  selectedApprovalStatus: string | undefined;
  setSelectedApprovalStatus: (status: string | undefined) => void;
  setDateRange: (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    <Card 
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: 'none',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginBottom: '24px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        paddingBottom: '12px', 
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FilterOutlined style={{ color: '#667eea', fontSize: '20px' }} />
          <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>Bộ lọc tìm kiếm</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
      <Input
        placeholder="Tìm kiếm theo tên, email..."
        prefix={<SearchOutlined />}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onPressEnter={() => setSearch(searchInput)}
          style={{ 
            minWidth: '250px',
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
        allowClear
      />
      <Select
        placeholder="Lọc theo trạng thái duyệt"
        value={selectedApprovalStatus}
        onChange={(val) => setSelectedApprovalStatus(val || undefined)}
          style={{ 
            minWidth: '180px',
            borderRadius: '8px'
          }}
        allowClear
      >
        <Select.Option value="">Tất cả</Select.Option>
        <Select.Option value="pending">Chờ duyệt</Select.Option>
        <Select.Option value="approved">Đã duyệt</Select.Option>
        <Select.Option value="rejected">Từ chối</Select.Option>
      </Select>
      <DatePicker.RangePicker
        placeholder={["Từ ngày", "Đến ngày"]}
        onChange={(dates) => setDateRange(dates)}
          style={{ 
            borderRadius: '8px',
            border: '1px solid #d9d9d9'
          }}
        format="DD/MM/YYYY"
      />
    </div>
  </Card>
  </motion.div>
);

const InstructorList = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(false);
  const rejectReasonRef = useRef<string>('');
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [viewingInstructor, setViewingInstructor] = useState<Instructor | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  });

  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Stats - tính toán từ dữ liệu thực tế
  const stats = {
    total: instructors.length,
    approved: instructors.filter((u) => u.approvalStatus === 'approved').length,
    pending: instructors.filter((u) => u.approvalStatus === 'pending').length,
    rejected: instructors.filter((u) => u.approvalStatus === 'rejected').length,
  };

  // Handlers
  const handleViewDetails = async (inst: Instructor) => {
    try {
      setLoading(true);
      const response = await config.get(`/users/instructors/${inst.id}/detail`);
      console.log("Instructor detail response:", response.data);

      if (response.data.success) {
        const detailedInstructor = response.data.data;
        // Map the detailed data to match our interface
        const mappedInstructor: Instructor = {
          ...inst,
          ...detailedInstructor,
          approvalStatus: detailedInstructor.approvalStatus || inst.approvalStatus,
          // Sử dụng dữ liệu trực tiếp từ cấp cao nhất trước, sau đó fallback về cấp lồng nhau
          degree: detailedInstructor.degree || detailedInstructor.instructorProfile?.instructorInfo?.degree || inst.degree,
          university: detailedInstructor.university || detailedInstructor.instructorProfile?.instructorInfo?.university || inst.university,
          major: detailedInstructor.major || detailedInstructor.instructorProfile?.instructorInfo?.major || inst.major,
          graduationYear: detailedInstructor.graduationYear || detailedInstructor.instructorProfile?.instructorInfo?.graduationYear || inst.graduationYear,
          expertise: detailedInstructor.expertise || detailedInstructor.instructorProfile?.instructorInfo?.specializations || inst.expertise,
          experienceYears: detailedInstructor.experienceYears || detailedInstructor.instructorProfile?.instructorInfo?.experience_years || inst.experienceYears,
          experienceDescription: detailedInstructor.experienceDescription || detailedInstructor.instructorProfile?.instructorInfo?.teaching_experience?.description || inst.experienceDescription,
          cvUrl: detailedInstructor.cvUrl || detailedInstructor.instructorProfile?.instructorInfo?.cv_file || inst.cvUrl,
          certificates: detailedInstructor.certificates || detailedInstructor.instructorProfile?.instructorInfo?.certificates || inst.certificates,
          demoVideoUrl: detailedInstructor.demoVideoUrl || detailedInstructor.instructorProfile?.instructorInfo?.demo_video || inst.demoVideoUrl,
          bio: detailedInstructor.bio || detailedInstructor.instructorProfile?.bio || inst.bio,
          github: detailedInstructor.github || detailedInstructor.instructorProfile?.social_links?.github || inst.github,
          facebook: detailedInstructor.facebook || detailedInstructor.instructorProfile?.social_links?.facebook || inst.facebook,
          website: detailedInstructor.website || detailedInstructor.instructorProfile?.social_links?.website || inst.website,
          applicationDate: detailedInstructor.applicationDate || inst.applicationDate,
        };
        setViewingInstructor(mappedInstructor);
        setIsDetailsModalVisible(true);
      } else {
        message.error("Không thể lấy thông tin chi tiết giảng viên");
      }
    } catch (error) {
      console.error("Error fetching instructor details:", error);
      message.error("Không thể lấy thông tin chi tiết giảng viên");
      // Fallback to basic info
      setViewingInstructor(inst);
      setIsDetailsModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination((prev) => ({ ...prev, current: pag.current || 1, pageSize: pag.pageSize || 50 }));
  };

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedApprovalStatus) params.approvalStatus = selectedApprovalStatus;

      // Xử lý date range filter
      if (dateRange?.[0]) {
        params.from = dateRange[0].startOf('day').toISOString();
      }
      if (dateRange?.[1]) {
        params.to = dateRange[1].endOf('day').toISOString();
      }

      console.log("Fetching instructors with params:", params);
      const response = await config.get("/users/instructors", { params });
      console.log("API Response:", response.data);
      const rawInstructors = response.data.data.instructors || [];
      const mappedInstructors = rawInstructors.map((inst: any) => ({
        ...inst,
        approvalStatus: inst.approvalStatus || inst.approval_status || 'pending',
      }));
      console.log("Mapped Instructors:", mappedInstructors);
      setInstructors(mappedInstructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      message.error("Không thể lấy danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  }, [search, selectedApprovalStatus, dateRange]);

  // Realtime updates - fetch data every 30 seconds
  useEffect(() => {
    fetchInstructors();

    const interval = setInterval(() => {
      fetchInstructors();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchInstructors, pagination.current]);

  const handleApprove = async (instructor: Instructor) => {
    Modal.confirm({
      title: "Xác nhận duyệt giảng viên?",
      content: `Bạn có chắc chắn muốn duyệt giảng viên "${instructor.fullname}"?`,
      okText: "Duyệt",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await config.put(`/users/instructors/${instructor.id}/approval`, {
            status: "approved",
          });
          message.success(`Đã duyệt giảng viên: ${instructor.fullname}`);

          setInstructors(prev => prev.map(inst =>
            inst.id === instructor.id
              ? { ...inst, approvalStatus: 'approved' }
              : inst
          ));

          await fetchInstructors();
        } catch (error) {
          console.error("Error approving instructor:", error);
          message.error("Duyệt thất bại");
        }
      },
    });
  };

  const handleReject = async (instructor: Instructor) => {
    rejectReasonRef.current = "";

    Modal.confirm({
      title: "Từ chối giảng viên",
      content: (
        <div>
          <p>Nhập lý do từ chối:</p>
          <Input.TextArea
            placeholder="Lý do từ chối"
            rows={4}
            onChange={(e) =>
              (rejectReasonRef.current = e.target.value)
            }
          />
        </div>
      ),
      okText: "Từ chối",
      cancelText: "Hủy",
      onOk: async () => {
        if (!rejectReasonRef.current.trim()) {
          message.warning("Vui lòng nhập lý do từ chối");
          return Promise.reject();
        }
        try {
          await config.put(`/users/instructors/${instructor.id}/approval`, {
            status: "rejected",
            rejection_reason: rejectReasonRef.current,
          });
          message.success(`Đã từ chối giảng viên: ${instructor.fullname}`);

          setInstructors(prev => prev.map(inst =>
            inst.id === instructor.id
              ? { ...inst, approvalStatus: 'rejected' }
              : inst
          ));

          await fetchInstructors();
        } catch (error) {
          console.error("Lỗi từ chối:", error);
          message.error("Từ chối thất bại");
        }
      }
    });
  };

  // Helper to get approval status tag
  const getApprovalStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      approved: { color: "success", label: "Đã duyệt", icon: <CheckCircleOutlined /> },
      rejected: { color: "error", label: "Từ chối", icon: <CloseCircleOutlined /> },
      pending: { color: "warning", label: "Chờ duyệt", icon: <ClockCircleOutlined /> },
    };

    const tag = statusMap[status] || { color: "default", label: status, icon: null };
    return (
      <Tag
        color={tag.color}
        icon={tag.icon}
        className="status-tag"
      >
        {tag.label}
      </Tag>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ marginBottom: '32px' }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
                  <TrophyOutlined style={{ marginRight: '12px', color: '#667eea' }} />
            Quản lý giảng viên
          </Title>
                <Text type="secondary" style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#666' }}>
            Quản lý và theo dõi thông tin tất cả giảng viên hệ thống
          </Text>
        </div>
      </div>
          </Card>
        </motion.div>

      <StatCards stats={stats} />

      <FilterSection
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        selectedApprovalStatus={selectedApprovalStatus}
        setSelectedApprovalStatus={setSelectedApprovalStatus}
        setDateRange={setDateRange}
      />

        {/* Course List Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card 
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: 'none',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              paddingBottom: '12px', 
              borderBottom: '1px solid #f0f0f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BookOutlined style={{ color: '#667eea', fontSize: '20px' }} />
                <Title level={4} style={{ margin: 0, color: '#1a1a1a' }}>
              Danh sách tất cả giảng viên
            </Title>
                <Badge count={instructors.length} showZero style={{ 
                  backgroundColor: '#1890ff',
                  borderRadius: '8px'
                }} />
          </div>
              <div>
                <Text type="secondary" style={{ fontSize: '14px' }}>
              Hiển thị {((pagination.current - 1) * pagination.pageSize) + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} của {pagination.total} giảng viên
            </Text>
          </div>
        </div>

        <Table
          loading={loading}
          rowKey="id"
          dataSource={instructors.map((u, idx) => ({ ...u, number: idx + 1 }))}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} giảng viên`,
            pageSizeOptions: ['10', '15', '20', '50', '100', '200'],
            size: 'small',
          }}
          onChange={handleTableChange}
          className="user-table"
          scroll={{ x: 1100 }}
          size="small"
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
              align: 'center' as const,
              render: (_, __, index) => (
                <Badge count={index + 1} showZero style={{ backgroundColor: '#1890ff' }} />
              ),
            },
            {
              title: "Giảng viên",
              dataIndex: "fullname",
              width: 250,
              align: 'left' as const,
              render: (_: unknown, record: Instructor) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar
                    src={record.avatar}
                    icon={<UserOutlined />}
                    size={40}
                    style={{ border: '2px solid #f0f0f0' }}
                  />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                      {record.fullname}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MailOutlined style={{ fontSize: '12px' }} />
                      {record.email}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              title: "Trạng thái duyệt",
              dataIndex: "approvalStatus",
              align: 'center' as const,
              width: 120,
              render: (_: any, record: Instructor) => getApprovalStatusTag(record.approvalStatus),
            },
            {
              title: "Ngày nộp hồ sơ",
              dataIndex: "applicationDate",
              width: 150,
              align: 'center' as const,
              render: (date: string) => (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '2px' }}>
                    {dayjs(date).format("DD/MM/YYYY")}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    {dayjs(date).format("HH:mm")}
                  </div>
                </div>
              ),
            },
            {
              title: "Thao tác",
              key: "action",
              width: 150,
              align: "center" as const,
              render: (_: unknown, record: Instructor) => {
                if (record.approvalStatus === "pending") {
                  return (
                    <Space size="small">
                      <Tooltip title="Xem chi tiết">
                        <Button
                          type="text"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(record);
                          }}
                          style={{ color: '#1890ff' }}
                        />
                      </Tooltip>
                      <Tooltip title="Duyệt giảng viên">
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(record);
                          }}
                        >
                          Duyệt
                        </Button>
                      </Tooltip>
                      <Tooltip title="Từ chối">
                        <Button
                          danger
                          size="small"
                          icon={<CloseCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(record);
                          }}
                        >
                          Từ chối
                        </Button>
                      </Tooltip>
                    </Space>
                  );
                }

                return (
                  <Space size="small">
                    <Tooltip title="Xem chi tiết">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(record);
                        }}
                        style={{ color: '#1890ff' }}
                      />
                    </Tooltip>
                  </Space>
                );
              }
            }
          ]}
        />
      </Card>
      </motion.div>

      {/* Instructor Details Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <UserOutlined style={{ color: '#667eea', fontSize: '20px' }} />
            <Text strong style={{ fontSize: '18px', color: '#1a1a1a' }}>
            Chi tiết giảng viên
            </Text>
          </div>
        }
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
        style={{ borderRadius: '16px' }}
      >
        {viewingInstructor && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{ marginTop: '16px' }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px',
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <Avatar
                size={96}
                src={viewingInstructor.avatar && viewingInstructor.avatar !== 'default-avatar.jpg' && viewingInstructor.avatar !== '' && (viewingInstructor.avatar.includes('googleusercontent.com') || viewingInstructor.avatar.startsWith('http')) ? viewingInstructor.avatar : undefined}
                style={{ border: '2px solid #f0f0f0' }}
              />
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a', marginBottom: '8px' }}>
                  {viewingInstructor.fullname}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MailOutlined style={{ color: '#1890ff' }} />
                  {viewingInstructor.email}
                </div>
                <div>{getApprovalStatusTag(viewingInstructor.approvalStatus)}</div>
              </div>
            </div>

            <Card 
              style={{ 
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #f0f0f0',
                marginBottom: '20px'
              }} 
              bordered={false}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <CalendarOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày nộp hồ sơ:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {viewingInstructor.applicationDate ? dayjs(viewingInstructor.applicationDate).format("DD/MM/YYYY HH:mm") : "Chưa cập nhật"}
                    </Text>
                </div>
              </div>
            </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <PhoneOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Số điện thoại:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {viewingInstructor.phone || 'Chưa cập nhật'}
                    </Text>
              </div>
              </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <HomeOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Địa chỉ:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {viewingInstructor.address || 'Chưa cập nhật'}
                    </Text>
              </div>
              </div>
            </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <GiftOutlined style={{ color: '#eb2f96', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Ngày sinh:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {viewingInstructor.dob ? dayjs(viewingInstructor.dob).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                    </Text>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px 0'
              }}>
                <ManOutlined style={{ color: '#13c2c2', fontSize: '16px' }} />
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#1a1a1a' }}>Giới tính:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ fontSize: '14px', color: '#666' }}>
                      {viewingInstructor.gender || 'Chưa cập nhật'}
                    </Text>
                  </div>
                </div>
              </div>
            </Card>

            <Divider orientation="left">
              <StarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Học vấn & Chuyên môn
            </Divider>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Bằng cấp">{viewingInstructor.degree || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Trường đào tạo">{viewingInstructor.university || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Chuyên ngành">{viewingInstructor.major || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Năm tốt nghiệp">{viewingInstructor.graduationYear || "Chưa cập nhật"}</Descriptions.Item>
              <Descriptions.Item label="Lĩnh vực chuyên môn">
                {viewingInstructor.expertise && viewingInstructor.expertise.length > 0 ? viewingInstructor.expertise.map((exp) => <Tag key={exp}>{exp}</Tag>) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Số năm kinh nghiệm">{viewingInstructor.experienceYears || 0} năm</Descriptions.Item>
              <Descriptions.Item label="Mô tả kinh nghiệm" span={2}>
                <Paragraph style={{ marginBottom: 0 }}>{viewingInstructor.experienceDescription || "Chưa cập nhật"}</Paragraph>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">
              <BookOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Hồ sơ & Tài liệu
            </Divider>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="CV">
                {viewingInstructor.cvUrl ? (
                  <AntdLink href={viewingInstructor.cvUrl} target="_blank" rel="noopener noreferrer">Tải CV</AntdLink>
                ) : "Chưa cập nhật"}
              </Descriptions.Item>
              <Descriptions.Item label="Chứng chỉ">
                {viewingInstructor.certificates && viewingInstructor.certificates.length > 0 ? (
                  <ul style={{ paddingLeft: 16, margin: 0 }}>
                    {viewingInstructor.certificates.map((cert, index) => (
                      <li key={index}>
                        <AntdLink href={typeof cert === 'string' ? cert : cert.url} target="_blank" rel="noopener noreferrer">
                          {typeof cert === 'string' ? `Chứng chỉ ${index + 1}` : (cert.name || `Chứng chỉ ${index + 1}`)}
                        </AntdLink>
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
          </motion.div>
        )}
      </Modal>
    </div>
    </motion.div>
  );
};

export default InstructorList;
