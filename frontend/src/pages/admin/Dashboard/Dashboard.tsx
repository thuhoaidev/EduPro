import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Progress, Tooltip, Avatar, Spin, Alert } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  DollarOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import styles from './Dashboard.module.css';
import { config } from '../../../api/axios';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  // State lưu trữ dữ liệu
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [coursesRes, usersRes, instructorsRes] = await Promise.all([
          config.get('/courses'),
          config.get('/users'),
          config.get('/users/instructors'),
        ]);
        setCourses(Array.isArray(coursesRes.data.data) ? coursesRes.data.data : []);
        setUsers(Array.isArray(usersRes.data.data?.users) ? usersRes.data.data.users : []);
        setInstructors(Array.isArray(instructorsRes.data.data?.instructors) ? instructorsRes.data.data.instructors : []);
        // Debug dữ liệu
        console.log('courses:', coursesRes.data.data);
        console.log('users:', usersRes.data.data);
        console.log('instructors:', instructorsRes.data.data);
      } catch (err: any) {
        setCourses([]);
        setUsers([]);
        setInstructors([]);
        setError('Không thể lấy dữ liệu từ server hoặc token không hợp lệ!');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // Lọc chỉ lấy giảng viên đã duyệt
  const approvedInstructors = (instructors || []).filter(
    (ins: any) => ins.approvalStatus === 'approved' || ins.approval_status === 'approved'
  );
  // Debug danh sách giảng viên đã duyệt
  console.log('approvedInstructors:', approvedInstructors.map(i => i._id || i.id));

  // Gộp tất cả user và instructor đã duyệt lại để tìm kiếm
  const allPeople = [...(users || []), ...approvedInstructors];

  // Hàm lấy tên và avatar từ object, ObjectId hoặc ID string
  const getInfo = (ins: any) => {
    if (!ins) return { name: 'Không rõ', avatar: undefined };
    // Nếu là object đã populate từ backend
    if (typeof ins === 'object' && (ins.fullname || ins.name)) {
      return {
        name: ins.fullname || ins.name,
        avatar: ins.avatar,
      };
    }
    // Nếu là object có _id hoặc id
    if (typeof ins === 'object' && (ins._id || ins.id)) {
      const idStr = String(ins._id || ins.id);
      const found = allPeople.find(
        u => u && (String(u._id) === idStr || String(u.id) === idStr)
      );
      return found
        ? { name: found.fullname || found.name, avatar: found.avatar }
        : { name: 'Không rõ', avatar: undefined };
    }
    // Nếu là ObjectId hoặc string
    const idStr = String(ins);
    const found = allPeople.find(
      u => u && (String(u._id) === idStr || String(u.id) === idStr)
    );
    return found
      ? { name: found.fullname || found.name, avatar: found.avatar }
      : { name: 'Không rõ', avatar: undefined };
  };

  // Cột cho bảng khóa học
  const columns = [
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      width: 250,
      render: (text: string) => (
        <Text strong className={styles.courseName}>{text}</Text>
      ),
    },
    {
      title: 'Ảnh',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      width: 80,
      render: (url: string) => (
        url ? <img src={url} alt="thumbnail" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : 'Không có'
      ),
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (value: number) => <Text>{value?.toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Giảm giá',
      dataIndex: 'discount',
      key: 'discount',
      width: 100,
      render: (value: number) => <Text>{value}%</Text>,
    }
  ];
  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <Title level={2}>Tổng quan</Title>
        <Text type="secondary" className={styles.lastUpdated}>
          Cập nhật lần cuối: Hôm nay, 15:30
        </Text>
      </div>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message={error} type="error" showIcon style={{ margin: 24 }} />
      ) : (
        <>
          {/* Thống kê tổng quan */}
          <Row gutter={[24, 24]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="outlined" className={styles.statCard}>
                <Statistic
                  title={
                    <div className={styles.cardTitle}>
                      <UserOutlined className={styles.cardIcon} />
                      <span>Tổng số học viên</span>
                    </div>
                  }
                  value={users.length}
                  valueStyle={{ color: 'var(--primary-color)' }}
                  suffix={
                    <Tooltip title="Tăng 12% so với tháng trước">
                      <span className={styles.trendUp}>
                        <ArrowUpOutlined style={{ color: 'var(--primary-color)' }} /> 12%
                      </span>
                    </Tooltip>
                  }
                />
                <div className={styles.cardFooter}>
                  <Text type="secondary">So với tháng trước</Text>
                  <Progress percent={12} size="small" showInfo={false} strokeColor="var(--primary-color)" />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="outlined" className={styles.statCard}>
                <Statistic
                  title={
                    <div className={styles.cardTitle}>
                      <BookOutlined className={styles.cardIcon} />
                      <span>Khóa học</span>
                    </div>
                  }
                  value={courses.length}
                  valueStyle={{ color: 'var(--primary-color)' }}
                  suffix={
                    <Tooltip title="Tăng 8% so với tháng trước">
                      <span className={styles.trendUp}>
                        <ArrowUpOutlined style={{ color: 'var(--primary-color)' }} /> 8%
                      </span>
                    </Tooltip>
                  }
                />
                <div className={styles.cardFooter}>
                  <Text type="secondary">{courses.length > 0 ? `${courses.length} khóa học` : 'Không có dữ liệu'}</Text>
                  <Progress percent={8} size="small" showInfo={false} strokeColor="var(--primary-color)" />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="outlined" className={styles.statCard}>
                <Statistic
                  title={
                    <div className={styles.cardTitle}>
                      <DollarOutlined className={styles.cardIcon} />
                      <span>Doanh thu tháng</span>
                    </div>
                  }
                  value={45600000}
                  valueStyle={{ color: 'var(--primary-color)' }}
                  formatter={(value) => `${value.toLocaleString('vi-VN')} ₫`}
                />
                <div className={styles.cardFooter}>
                  <Text type="secondary">Tăng 15% so với tháng trước</Text>
                  <Progress percent={15} size="small" showInfo={false} strokeColor="var(--primary-color)" />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card variant="outlined" className={styles.statCard}>
                <Statistic
                  title={
                    <div className={styles.cardTitle}>
                      <TeamOutlined className={styles.cardIcon} />
                      <span>Giảng viên</span>
                    </div>
                  }
                  value={approvedInstructors.length}
                  valueStyle={{ color: 'var(--primary-color)' }}
                  suffix={
                    <Tooltip title="Tăng 5% so với tháng trước">
                      <span className={styles.trendUp}>
                        <ArrowUpOutlined style={{ color: 'var(--primary-color)' }} /> 5%
                      </span>
                    </Tooltip>
                  }
                />
                <div className={styles.cardFooter}>
                  <Text type="secondary">{approvedInstructors.length > 0 ? `${approvedInstructors.length} giảng viên` : 'Không có dữ liệu'}</Text>
                  <Progress percent={5} size="small" showInfo={false} strokeColor="var(--primary-color)" />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Thống kê chi tiết */}
          <Row className={styles.detailsRow} justify="center">
  <Col >
    <Card
      title={
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong style={{ fontSize: 18 }}>Khóa học mới cập nhật</Text>
          <Text type="secondary" style={{ fontSize: 15 }}>{courses.length} khóa học</Text>
        </div>
      }
      bordered={false}
      className={styles.tableCard}
      style={{
        borderRadius: 16,
        boxShadow: '0 2px 12px #f0f1f2',
        marginTop: 24,
        padding: 0,
      }}
      bodyStyle={{ padding: 0 }}
    >
      <Table
        dataSource={courses}
        columns={columns}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        className={styles.coursesTable}
        rowKey="_id"
        scroll={{ x: 1100 }}
        bordered
        rowClassName={(_, idx) => idx % 2 === 0 ? styles.evenRow : styles.oddRow}
      />
    </Card>
  </Col>
</Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;