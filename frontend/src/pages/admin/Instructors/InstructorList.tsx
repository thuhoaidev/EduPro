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
import styles from "../Users/UserPage.module.css";
import type { TablePaginationConfig } from 'antd/es/table';
import { config } from "../../../api/axios";
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
  <Row gutter={[24, 24]} className={styles.statsRow}>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#e6f7ff' }}>
            <TeamOutlined style={{ color: '#1890ff' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Tổng giảng viên"
              value={stats.total}
              valueStyle={{ color: '#1890ff', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">+15% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#f6ffed' }}>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Đã duyệt"
              value={stats.approved}
              valueStyle={{ color: '#52c41a', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <RiseOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">+8% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fff7e6' }}>
            <UserSwitchOutlined style={{ color: '#faad14' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Chờ duyệt"
              value={stats.pending}
              valueStyle={{ color: '#faad14', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <RiseOutlined style={{ color: '#faad14' }} />
              <Text type="secondary">+12% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
    <Col xs={24} sm={12} lg={6}>
      <Card className={styles.statCard} bordered={false}>
        <div className={styles.statContent}>
          <div className={styles.statIcon} style={{ backgroundColor: '#fff1f0' }}>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          </div>
          <div className={styles.statInfo}>
            <Statistic
              title="Từ chối"
              value={stats.rejected}
              valueStyle={{ color: '#ff4d4f', fontSize: 28, fontWeight: 600 }}
            />
            <div className={styles.statTrend}>
              <FallOutlined style={{ color: '#ff4d4f' }} />
              <Text type="secondary">-5% tháng này</Text>
            </div>
          </div>
        </div>
      </Card>
    </Col>
  </Row>
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
  <Card className={styles.filterCard} bordered={false}>
    <div className={styles.filterHeader}>
      <div className={styles.filterTitle}>
        <FilterOutlined className={styles.filterIcon} />
        <Text strong>Bộ lọc tìm kiếm</Text>
      </div>
      <div className={styles.realtimeIndicator}>
        <ClockCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
        <Text type="secondary">Cập nhật tự động</Text>
      </div>
    </div>
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
        placeholder="Lọc theo trạng thái duyệt"
        value={selectedApprovalStatus}
        onChange={(val) => setSelectedApprovalStatus(val || undefined)}
        className={styles.filterSelect}
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
        className={styles.filterDateRange}
        format="DD/MM/YYYY"
      />
    </div>
  </Card>
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
    pageSize: 10,
    total: 0,
  });

  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  // Stats
  const stats = {
    total: instructors.length,
    approved: instructors.filter((u) => u.approvalStatus === 'approved').length,
    pending: instructors.filter((u) => u.approvalStatus === 'pending').length,
    rejected: instructors.filter((u) => u.approvalStatus === 'rejected').length,
  };

  // Handlers
  const handleViewDetails = (inst: Instructor) => {
    setViewingInstructor(inst);
    setIsDetailsModalVisible(true);
  };

  const handleTableChange = (pag: TablePaginationConfig) => {
    setPagination((prev) => ({ ...prev, current: pag.current || 1, pageSize: pag.pageSize || 10 }));
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
        className={styles.statusTag}
      >
        {tag.label}
      </Tag>
    );
  };

  return (
    <div className={styles.userPageContainer}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <Title level={2} className={styles.pageTitle}>
            <TrophyOutlined className={styles.titleIcon} />
            Quản lý giảng viên
          </Title>
          <Text type="secondary" className={styles.pageSubtitle}>
            Quản lý và theo dõi thông tin giảng viên hệ thống
          </Text>
        </div>
      </div>

      <StatCards stats={stats} />
      
      <FilterSection
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSearch={setSearch}
        selectedApprovalStatus={selectedApprovalStatus}
        setSelectedApprovalStatus={setSelectedApprovalStatus}
        setDateRange={setDateRange}
      />

      {/* Hiển thị thông tin filter đang hoạt động */}
      {(search || selectedApprovalStatus || dateRange) && (
        <Card className={styles.activeFiltersCard} bordered={false}>
          <div className={styles.activeFiltersHeader}>
            <Text strong>Bộ lọc đang hoạt động:</Text>
          </div>
          <div className={styles.activeFiltersContent}>
            {search && (
              <Tag color="blue" closable onClose={() => setSearch("")}>
                Tìm kiếm: "{search}"
              </Tag>
            )}
            {selectedApprovalStatus && (
              <Tag color="green" closable onClose={() => setSelectedApprovalStatus(undefined)}>
                Trạng thái: {selectedApprovalStatus === 'pending' ? 'Chờ duyệt' : selectedApprovalStatus === 'approved' ? 'Đã duyệt' : 'Từ chối'}
              </Tag>
            )}
            {dateRange && dateRange[0] && dateRange[1] && (
              <Tag color="orange" closable onClose={() => setDateRange(null)}>
                Từ {dateRange[0].format('DD/MM/YYYY')} đến {dateRange[1].format('DD/MM/YYYY')}
              </Tag>
            )}
          </div>
        </Card>
      )}

      <Card className={styles.userTableCard} bordered={false}>
        <div className={styles.tableHeader}>
          <div className={styles.tableTitleSection}>
            <Title level={4} className={styles.tableTitle}>
              <BookOutlined className={styles.tableIcon} />
              Danh sách hồ sơ giảng viên
            </Title>
            <Badge count={instructors.length} showZero className={styles.userCountBadge} />
          </div>
          <div className={styles.tableActions}>
            <Text type="secondary">
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
          }}
          onChange={handleTableChange}
          className={styles.userTable}
          scroll={{ x: 1200 }}
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
              width: 80,
              align: 'center' as const,
              render: (_, __, index) => (
                <Badge count={index + 1} showZero style={{ backgroundColor: '#1890ff' }} />
              ),
            },
            {
              title: "Giảng viên",
              dataIndex: "fullname",
              width: 300,
              align: 'left' as const,
              render: (_: unknown, record: Instructor) => (
                <div className={styles.avatarCell}>
                  <Avatar 
                    src={record.avatar} 
                    icon={<UserOutlined />} 
                    size="large"
                    className={styles.userAvatar}
                  />
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{record.fullname}</div>
                    <div className={styles.userEmail}>
                      <MailOutlined className={styles.emailIcon} />
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
              width: 150,
              render: (_: any, record: Instructor) => getApprovalStatusTag(record.approvalStatus),
            },
            {
              title: "Ngày nộp hồ sơ",
              dataIndex: "applicationDate",
              width: 180,
              align: 'center' as const,
              render: (date: string) => (
                <div className={styles.dateCell}>
                  <CalendarOutlined className={styles.dateIcon} />
                  <Text>{dayjs(date).format("DD/MM/YYYY HH:mm")}</Text>
                </div>
              ),
            },
            {
              title: "Thao tác",
              key: "action",
              width: 200,
              align: "center" as const,
              render: (_: unknown, record: Instructor) => {
                if (record.approvalStatus === "pending") {
                  return (
                    <Space className={styles.actionBtns}>
                      <Tooltip title="Xem chi tiết">
                        <Button
                          type="text"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(record);
                          }}
                          className={styles.actionBtn}
                        />
                      </Tooltip>
                      <Tooltip title="Duyệt giảng viên">
                        <Button
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(record);
                          }}
                          className={styles.actionBtn}
                        >
                          Duyệt
                        </Button>
                      </Tooltip>
                      <Tooltip title="Từ chối">
                        <Button
                          danger
                          icon={<CloseCircleOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(record);
                          }}
                          className={styles.actionBtn}
                        >
                          Từ chối
                        </Button>
                      </Tooltip>
                    </Space>
                  );
                }

                return (
                  <Space className={styles.actionBtns}>
                    <Tooltip title="Xem chi tiết">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(record);
                        }}
                        className={styles.actionBtn}
                      />
                    </Tooltip>
                  </Space>
                );
              }
            }
          ]}
        />
      </Card>

      {/* Instructor Details Modal */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            <UserOutlined className={styles.modalIcon} />
            Chi tiết giảng viên
          </div>
        }
        open={isDetailsModalVisible}
        onCancel={() => setIsDetailsModalVisible(false)}
        footer={null}
        width={900}
        destroyOnHidden
        className={styles.userDetailModal}
      >
        {viewingInstructor && (
          <div className={styles.userDetailWrapper}>
            <div className={styles.userDetailHeaderBox}>
              <Avatar size={96} src={viewingInstructor.avatar} className={styles.userDetailAvatar} />
              <div className={styles.userDetailHeaderInfo}>
                <div className={styles.userDetailName}>{viewingInstructor.fullname}</div>
                <div className={styles.userDetailEmail}>
                  <MailOutlined className={styles.emailIcon} />
                  {viewingInstructor.email}
                </div>
                <div className={styles.userDetailRoleTag}>
                  {getApprovalStatusTag(viewingInstructor.approvalStatus)}
                </div>
              </div>
            </div>

            <div className={styles.userDetailCard}>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><CalendarOutlined /> Ngày nộp hồ sơ:</span>
                <span>{viewingInstructor.applicationDate ? dayjs(viewingInstructor.applicationDate).format("DD/MM/YYYY HH:mm") : "Chưa cập nhật"}</span>
              </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><PhoneOutlined /> Số điện thoại:</span>
                <span>{viewingInstructor.phone || 'Chưa cập nhật'}</span>
              </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><HomeOutlined /> Địa chỉ:</span>
                <span>{viewingInstructor.address || 'Chưa cập nhật'}</span>
              </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><GiftOutlined /> Ngày sinh:</span>
                <span>{viewingInstructor.dob ? dayjs(viewingInstructor.dob).format('DD/MM/YYYY') : 'Chưa cập nhật'}</span>
              </div>
              <div className={styles.userDetailRow}>
                <span className={styles.userDetailLabel}><ManOutlined /> Giới tính:</span>
                <span>{viewingInstructor.gender || 'Chưa cập nhật'}</span>
              </div>
            </div>

            <Divider orientation="left">
              <StarOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Học vấn & Chuyên môn
            </Divider>
            <Descriptions column={2} bordered size="small" className={styles.detailDescriptions}>
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
            <Descriptions column={2} bordered size="small" className={styles.detailDescriptions}>
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
                        <AntdLink href={cert.file || cert.url} target="_blank" rel="noopener noreferrer">
                          {cert.name || cert.original_name || `Chứng chỉ ${index + 1}`}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InstructorList;
