import React, { useEffect, useState } from "react";
import { Card, Row, Col, DatePicker, Select, Space, message } from "antd";
import { Column, Line } from "@ant-design/charts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type TimeType = "day" | "month" | "year";

interface ViolationStats {
  totalReports: number;
  handledReports: number;
  pendingReports: number;
  newReportsToday: number;
}

interface ViolationChartItem {
  date: string;
  count: number;
}

// Fake API: Lấy tổng quan
const fetchViolationStats = async (): Promise<ViolationStats> => {
  return new Promise(resolve =>
    setTimeout(() => {
      resolve({
        totalReports: 134,
        handledReports: 85,
        pendingReports: 49,
        newReportsToday: 7,
      });
    }, 300)
  );
};

// Fake API: Lấy dữ liệu biểu đồ
const fetchViolationChartData = async (type: TimeType, range: [string, string]): Promise<ViolationChartItem[]> => {
  const data: ViolationChartItem[] = [];
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
      count: Math.floor(Math.random() * 10) + 1,
    });
  }

  return new Promise(resolve => setTimeout(() => resolve(data), 300));
};

const ReportStatistics = () => {
  const [overview, setOverview] = useState<ViolationStats>({
    totalReports: 0,
    handledReports: 0,
    pendingReports: 0,
    newReportsToday: 0,
  });

  const [chartData, setChartData] = useState<ViolationChartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState<[string, string]>([
    dayjs().subtract(7, "day").format("YYYY-MM-DD"),
    dayjs().format("YYYY-MM-DD"),
  ]);
  const [type, setType] = useState<TimeType>("day");

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await fetchViolationStats();
      setOverview(data);
    } catch {
      message.error("Lấy dữ liệu báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    setLoading(true);
    try {
      const data = await fetchViolationChartData(type, range);
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
    yField: "count",
    color: "#ff4d4f",
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
      title: { text: "Số lượt báo cáo" },
    },
    meta: {
      count: { alias: "Lượt báo cáo" },
      date: { alias: "Thời gian" },
    },
  };

  const lineConfig = {
    ...columnConfig,
    smooth: true,
    color: "#faad14",
  };

  const getPickerMode = (type: TimeType): "date" | "month" | "year" => {
    return type === "day" ? "date" : type;
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 24 }}>Thống kê báo cáo vi phạm</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card loading={loading} variant="borderless" style={{ textAlign: "center" }}>
            <h3>Tổng lượt báo cáo</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.totalReports}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} variant="borderless" style={{ textAlign: "center" }}>
            <h3>Đã xử lý</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.handledReports}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} variant="borderless" style={{ textAlign: "center" }}>
            <h3>Chưa xử lý</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.pendingReports}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading} variant="borderless" style={{ textAlign: "center" }}>
            <h3>Báo cáo mới hôm nay</h3>
            <p style={{ fontSize: 24, fontWeight: "bold" }}>{overview.newReportsToday}</p>
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }}>
        <Select value={type} onChange={setType} style={{ width: 120 }}>
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
              setRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
            }
          }}
        />
      </Space>

      <Card title="Biểu đồ lượt báo cáo vi phạm" variant="borderless">
        <Column {...columnConfig} />
      </Card>

      <Card title="Biểu đồ đường lượt báo cáo vi phạm" variant="borderless" style={{ marginTop: 24 }}>
        <Line {...lineConfig} />
      </Card>
    </div>
  );
};

export default ReportStatistics;
