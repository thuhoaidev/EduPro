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
} from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  UserOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { UserStatus, type User } from "../../../interfaces/Admin.interface";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useRef } from "react";
import styles from "../Users/UserPage.module.css";
import type { TablePaginationConfig } from 'antd/es/table';
import { config } from "../../../api/axios";
dayjs.locale("vi");

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
  <Row gutter={[16, 16]} className={styles.statsRow} justify="center">
    <Col xs={24} sm={12} md={6}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Tổng số giảng viên"
          value={stats.total}
          prefix={<TeamOutlined className={styles.statIcon} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Giảng viên đã duyệt"
          value={stats.approved}
          prefix={<CheckCircleOutlined className={styles.statIcon} style={{ color: "#52c41a" }} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Chờ duyệt"
          value={stats.pending}
          prefix={<UserSwitchOutlined className={styles.statIcon} style={{ color: "#faad14" }} />}
        />
      </Card>
    </Col>
    <Col xs={24} sm={12} md={6}>
      <Card className={styles.statsCard}>
        <Statistic
          title="Bị từ chối"
          value={stats.rejected}
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
      if (dateRange?.[0]) params.from = dateRange[0].toISOString();
      if (dateRange?.[1]) params.to = dateRange[1].toISOString();

      const response = await config.get("/users/instructors", { params });
      console.log("data", response.data)
      const rawInstructors = response.data.data.instructors || [];
      const mappedInstructors = rawInstructors.map((inst: any) => ({
        ...inst,
        approvalStatus: inst.approval_status || inst.approvalStatus || 'pending',
      }));
      setInstructors(mappedInstructors);
    } catch (error) {
      message.error("Không thể lấy danh sách giảng viên");
    } finally {
      setLoading(false);
    }
  }, [search, selectedApprovalStatus, dateRange]);

  useEffect(() => {
    fetchInstructors();
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
          await fetchInstructors(); // GỌI LẠI API để cập nhật danh sách
        } catch (error) {
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
          return Promise.reject(); // <- Dừng Modal.confirm
        }
        try {
          await config.put(`/users/instructors/${instructor.id}/approval`, {
            status: "rejected",
            rejection_reason: rejectReasonRef.current,
          });
          message.success(`Đã từ chối giảng viên: ${instructor.fullname}`);
          await fetchInstructors();
        } catch (error) {
          console.error("Lỗi từ chối:", error);
          message.error("Từ chối thất bại");
        }
      }

    });
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
        selectedApprovalStatus={selectedApprovalStatus}
        setSelectedApprovalStatus={setSelectedApprovalStatus}
        setDateRange={setDateRange}
      />
      <Card className={styles.userTableCard}>
        <Table
          loading={loading}
          rowKey="id"
          dataSource={instructors.map((u, idx) => ({ ...u, number: idx + 1 }))}
          pagination={pagination}
          onChange={handleTableChange}
          className={styles.userTable}
          scroll={{ x: true }}
          title={() => (
            <div className={styles.tableHeader}>
              <h4 className={styles.tableTitle}>Danh sách hồ sơ giảng viên chờ duyệt</h4>
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
              align: 'center',
            },
            {
              title: "Giảng viên",
              dataIndex: "fullname",
              align: 'left',
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
              title: "Trạng thái duyệt",
              dataIndex: "approvalStatus",
              align: 'center',
              width: 120,
              render: (_: any, record: Instructor) => {
                const status = record.approvalStatus;
                if (status === "approved") return <Tag color="green">Đã duyệt</Tag>;
                if (status === "rejected") return <Tag color="red">Từ chối</Tag>;
                return <Tag color="gold">Chờ duyệt</Tag>;
              },
            }
            ,
            {
              title: "Ngày nộp hồ sơ",
              dataIndex: "applicationDate",
              render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
              width: 150,
              align: 'center',
            },
            {
              title: "Thao tác",
              key: "action",
              width: 160,
              align: "center",
              render: (_: unknown, record: Instructor) => {
                if (record.approvalStatus === "pending") {
                  return (
                    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(record);
                        }}
                      >
                        Duyệt
                      </Button>

                      <Button
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(record);
                        }}
                      >
                        Từ chối
                      </Button>
                    </div>
                  );
                }

                // Đã xử lý: return null để ô này trống
                return null;
              }
            }



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
