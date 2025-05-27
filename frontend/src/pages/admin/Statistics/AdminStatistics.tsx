import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Select, Space, message } from "antd";
import { Column, Line } from "@ant-design/charts";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

// Fake API lấy dữ liệu thống kê tổng quan
const fetchOverviewStats = async () => {
  // Giả lập delay
  return new Promise(resolve =>
    setTimeout(() => {
      resolve({
        totalUsers: 1234,
        totalOrders: 567,
        totalRevenue: 8901234,
        newUsersToday: 12,
      });
    }, 300)
  );
};

// Fake API lấy dữ liệu biểu đồ doanh thu theo ngày/tháng/năm
// Loại: day/month/year
const fetchRevenueChartData = async (type: string, range: [string, string]) => {
  // Sinh dữ liệu giả lập
  const data = [];
  let startDate = moment(range[0]);
  let endDate = moment(range[1]);
  const diff = endDate.diff(startDate, type === "day" ? "days" : type === "month" ? "months" : "years");
  for (let i = 0; i <= diff; i++) {
    data.push({
      date: type === "day" ? startDate.clone().add(i, "days").format("YYYY-MM-DD")
        : type === "month" ? startDate.clone().add(i, "months").format("YYYY-MM")
        : startDate.clone().add(i, "years").format("YYYY"),
      revenue: Math.floor(Math.random() * 1000000) + 100000, // doanh thu giả
    });
  }
  return new Promise(resolve => setTimeout(() => resolve(data), 300));
};

const AdminStatistics = () => {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState<[string, string]>([
    moment().subtract(7, "days").format("YYYY-MM-DD"),
    moment().format("YYYY-MM-DD"),
  ]);
  const [type, setType] = useState<"day" | "month" | "year">("day");

  // Load tổng quan
  const loadOverview = async () => {
    setLoading(true);
    try {
      const data: any = await fetchOverviewStats();
      setOverview(data);
    } catch {
      message.error("Lấy dữ liệu tổng quan thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu biểu đồ
  const loadChartData = async () => {
    setLoading(true);
    try {
      const data: any = await fetchRevenueChartData(type, range);
      setChartData(data);
    } catch {
      message.error("Lấy dữ liệu biểu đồ thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    loadChartData();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [type, range]);

const columnConfig = {
  data: chartData,
  xField: "date",
  yField: "revenue",
  color: "#1890ff",
  label: {
    position: "middle",
    style: {
      fill: "#FFFFFF",
      opacity: 0.6,
    },
  },
  xAxis: {
    title: { text: type === "day" ? "Ngày" : type === "month" ? "Tháng" : "Năm" },
    label: { autoRotate: false },
  },
  yAxis: {
    title: { text: "Doanh thu (VND)" },
    label: {
      formatter: (v: number) => v.toLocaleString(),
    },
  },
  meta: {
    revenue: { alias: "Doanh thu" },
    date: { alias: "Thời gian" },
  },
};

  const lineConfig = {
    data: chartData,
    xField: "date",
    yField: "revenue",
    smooth: true,
    color: "#52c41a",
    xAxis: {
      title: { text: type === "day" ? "Ngày" : type === "month" ? "Tháng" : "Năm" },
      label: { autoRotate: false },
    },
    yAxis: {
      title: { text: "Doanh thu (VND)" },
      label: {
        formatter: (v: number) => v.toLocaleString(),
      },
    },
    meta: {
      revenue: { alias: "Doanh thu" },
      date: { alias: "Thời gian" },
    },
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Dashboard Thống kê tổng quan</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading} bordered={false} style={{ textAlign: "center" }}>
            <h3>Tổng số người dùng</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.totalUsers.toLocaleString()}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} bordered={false} style={{ textAlign: "center" }}>
            <h3>Tổng đơn hàng</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.totalOrders.toLocaleString()}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} bordered={false} style={{ textAlign: "center" }}>
            <h3>Tổng doanh thu (VND)</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.totalRevenue.toLocaleString()}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} bordered={false} style={{ textAlign: "center" }}>
            <h3>Người dùng mới hôm nay</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.newUsersToday.toLocaleString()}</p>
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select value={type} onChange={setType} style={{ width: 120 }}>
          <Option value="day">Ngày</Option>
          <Option value="month">Tháng</Option>
          <Option value="year">Năm</Option>
        </Select>

        <RangePicker
          allowClear={false}
          format={type === "day" ? "YYYY-MM-DD" : type === "month" ? "YYYY-MM" : "YYYY"}
          picker={type as "date" | "month" | "year"}
          value={[moment(range[0]), moment(range[1])]}
          onChange={(dates) => {
            if (dates && dates[0] && dates[1]) {
              setRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
            }
          }}
        />
      </Space>

      <Card title="Biểu đồ doanh thu" bordered={false}>
        <Column {...columnConfig} />
      </Card>

      <Card title="Biểu đồ đường doanh thu" bordered={false} style={{ marginTop: 24 }}>
        <Line {...lineConfig} />
      </Card>
    </div>
  );
};

export default AdminStatistics;
