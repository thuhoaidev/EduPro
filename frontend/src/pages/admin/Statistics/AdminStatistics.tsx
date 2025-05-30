import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Select, Space, message, Statistic } from "antd";
import { Column, Line } from "@ant-design/charts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type TimeType = "day" | "month" | "year";

interface OverviewStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  newUsersToday: number;
}

interface RevenueChartItem {
  date: string;
  revenue: number;
}

const fetchOverviewStats = async (): Promise<OverviewStats> => {
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

const fetchRevenueChartData = async (type: TimeType, range: [string, string]): Promise<RevenueChartItem[]> => {
  const data: RevenueChartItem[] = [];
  const startDate = dayjs(range[0]);
  const endDate = dayjs(range[1]);
  const unit = type;
  const diff = endDate.diff(startDate, unit);

  for (let i = 0; i <= diff; i++) {
    data.push({
      date:
        type === "day"
          ? startDate.add(i, "day").format("YYYY-MM-DD")
          : type === "month"
          ? startDate.add(i, "month").format("YYYY-MM")
          : startDate.add(i, "year").format("YYYY"),
      revenue: Math.floor(Math.random() * 1000000) + 100000,
    });
  }

  return new Promise(resolve => setTimeout(() => resolve(data), 300));
};

const AdminStatistics = () => {
  const [overview, setOverview] = useState<OverviewStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
  });

  const [chartData, setChartData] = useState<RevenueChartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState<[string, string]>([
    dayjs().subtract(7, "day").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
  ]);
  const [type, setType] = useState<TimeType>("day");

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await fetchOverviewStats();
      setOverview(data);
    } catch {
      message.error("Lấy dữ liệu tổng quan thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    setLoading(true);
    try {
      const data = await fetchRevenueChartData(type, range);
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

  const getPickerMode = (type: TimeType): "date" | "month" | "year" => {
    return type === "day" ? "date" : type;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Thống kê tổng quan</h2>
        <p className="text-gray-500 mt-1">Tổng quan về hoạt động và doanh thu của hệ thống</p>
      </div>

      {/* Overview Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
             <Statistic
              title="Tổng số người dùng"
              value={overview.totalUsers.toLocaleString()}
              // prefix={<UserOutlined />} // Add relevant icon if available
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
             <Statistic
              title="Tổng đơn hàng"
              value={overview.totalOrders.toLocaleString()}
              // prefix={<ShoppingCartOutlined />} // Add relevant icon if available
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
            <Statistic
              title="Tổng doanh thu (VND)"
              value={overview.totalRevenue.toLocaleString()}
              // prefix={<DollarCircleOutlined />} // Add relevant icon if available
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading} className="shadow-sm hover:shadow-md transition-shadow">
             <Statistic
              title="Người dùng mới hôm nay"
              value={overview.newUsersToday.toLocaleString()}
              // prefix={<UserAddOutlined />} // Add relevant icon if available
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter and Charts */}
      <Card className="shadow-sm">
         <Space className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="text-gray-700 text-base font-medium">Chọn thời gian:</span>
          <Select 
            value={type} 
            onChange={setType} 
            style={{ width: 160, height: 40 }}
            className="text-base"
          >
            <Select.Option value="day">Ngày</Select.Option>
            <Select.Option value="month">Tháng</Select.Option>
            <Select.Option value="year">Năm</Select.Option>
          </Select>

          <RangePicker
            allowClear={false}
            format={type === "day" ? "YYYY-MM-DD" : type === "month" ? "YYYY-MM" : "YYYY"}
            picker={getPickerMode(type)}
            value={[dayjs(range[0]), dayjs(range[1])]}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                setRange([
                  dates[0].format("YYYY-MM-DD"),
                  dates[1].format("YYYY-MM-DD"),
                ]);
              }
            }}
            style={{ 
              width: type === 'day' ? 320 : type === 'month' ? 240 : 160,
              height: 40
            }}
            className="text-base"
          />
        </Space>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
             <Card title="Biểu đồ cột doanh thu" bordered={false} className="h-full">
                <Column {...columnConfig} />
              </Card>
          </Col>
           <Col xs={24} lg={12}>
              <Card title="Biểu đồ đường doanh thu" bordered={false} className="h-full">
                <Line {...lineConfig} />
              </Card>
           </Col>
        </Row>

      </Card>


    </div>
  );
};

export default AdminStatistics;
