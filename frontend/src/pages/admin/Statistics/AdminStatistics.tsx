"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { format, subDays } from "date-fns"

type TimeType = "day" | "month" | "year"

interface OverviewStats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  newUsersToday: number
}

interface RevenueChartItem {
  date: string
  revenue: number
}

// Custom UI Components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
)

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
)

const Button = ({
  children,
  onClick,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: "default" | "outline"
}) => {
  const baseClasses =
    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantClasses =
    variant === "outline"
      ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500"
      : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </button>
  )
}

const Select = ({
  value,
  onChange,
  children,
  className = "",
}: {
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
  className?: string
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
  >
    {children}
  </select>
)

// Icons as simple SVG components
const UsersIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
    />
  </svg>
)

const ShoppingCartIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
    />
  </svg>
)

const DollarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
    />
  </svg>
)

const UserPlusIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
    />
  </svg>
)

const TrendingUpIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const BarChartIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
)

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)

const fetchOverviewStats = async (): Promise<OverviewStats> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        totalUsers: 1234,
        totalOrders: 567,
        totalRevenue: 8901234,
        newUsersToday: 12,
      })
    }, 300),
  )
}

const fetchRevenueChartData = async (type: TimeType, range: [string, string]): Promise<RevenueChartItem[]> => {
  const data: RevenueChartItem[] = []
  const startDate = new Date(range[0])
  const endDate = new Date(range[1])

  // Generate sample data based on time range
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + i)

    const date =
      type === "day"
        ? format(currentDate, "yyyy-MM-dd")
        : type === "month"
          ? format(currentDate, "yyyy-MM")
          : format(currentDate, "yyyy")

    data.push({
      date,
      revenue: Math.floor(Math.random() * 1000000) + 100000,
    })
  }

  return new Promise((resolve) => setTimeout(() => resolve(data), 300))
}

// Simple chart components
const BarChart = ({ data }: { data: RevenueChartItem[] }) => {
  const maxRevenue = Math.max(...data.map((item) => item.revenue))

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between h-64 gap-2">
        {data.slice(0, 10).map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1 group">
            <div className="text-xs text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {item.revenue.toLocaleString()}
            </div>
            <div
              className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm w-full transition-all hover:from-blue-700 hover:to-blue-500"
              style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: "4px" }}
            />
            <div className="text-xs text-gray-500 mt-2 transform rotate-45 origin-left">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LineChart = ({ data }: { data: RevenueChartItem[] }) => {
  const maxRevenue = Math.max(...data.map((item) => item.revenue))
  const minRevenue = Math.min(...data.map((item) => item.revenue))

  return (
    <div className="space-y-3">
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
          ))}

          {/* Line path */}
          <path
            d={`M ${data
              .slice(0, 10)
              .map(
                (item, index) =>
                  `${(index * 400) / 9} ${200 - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 180}`,
              )
              .join(" L ")}`}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            className="drop-shadow-sm"
          />

          {/* Area fill */}
          <path
            d={`M ${data
              .slice(0, 10)
              .map(
                (item, index) =>
                  `${(index * 400) / 9} ${200 - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 180}`,
              )
              .join(" L ")} L ${(9 * 400) / 9} 200 L 0 200 Z`}
            fill="url(#lineGradient)"
          />

          {/* Data points */}
          {data.slice(0, 10).map((item, index) => (
            <circle
              key={index}
              cx={(index * 400) / 9}
              cy={200 - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 180}
              r="4"
              fill="#10b981"
              className="drop-shadow-sm hover:r-6 transition-all cursor-pointer"
            />
          ))}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.slice(0, 10).map((item, index) => (
            <span key={index} className="transform rotate-45 origin-left">
              {item.date}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const AdminStatistics = () => {
  const [overview, setOverview] = useState<OverviewStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    newUsersToday: 0,
  })

  const [chartData, setChartData] = useState<RevenueChartItem[]>([])
  const [loading, setLoading] = useState(false)

  const [startDate, setStartDate] = useState(format(subDays(new Date(), 7), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [type, setType] = useState<TimeType>("day")

  const loadOverview = async () => {
    setLoading(true)
    try {
      const data = await fetchOverviewStats()
      setOverview(data)
    } catch {
      console.error("Lấy dữ liệu tổng quan thất bại")
    } finally {
      setLoading(false)
    }
  }

  const loadChartData = async () => {
    setLoading(true)
    try {
      const range: [string, string] = [startDate, endDate]
      const data = await fetchRevenueChartData(type, range)
      setChartData(data)
    } catch {
      console.error("Lấy dữ liệu biểu đồ thất bại")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
    loadChartData()
  }, [])

  useEffect(() => {
    loadChartData()
  }, [type, startDate, endDate])

  const statsCards = [
    {
      title: "Tổng số học viên",
      value: overview.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      change: "+12%",
      changeColor: "text-green-600",
    },
    {
      title: "Tổng khóa học đã bán",
      value: overview.totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
      change: "+8%",
      changeColor: "text-green-600",
    },
    {
      title: "Tổng doanh thu",
      value: `${overview.totalRevenue.toLocaleString()} VND`,
      icon: DollarIcon,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      change: "+23%",
      changeColor: "text-green-600",
    },
    {
      title: "Học viên mới hôm nay",
      value: overview.newUsersToday.toLocaleString(),
      icon: UserPlusIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      change: "+5%",
      changeColor: "text-green-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Dashboard Thống kê EduPro
          </h1>
          <p className="text-slate-600 text-lg">Tổng quan về hoạt động giảng dạy và doanh thu của nền tảng</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card
                key={index}
                className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className={`text-sm font-medium ${stat.changeColor} flex items-center gap-1`}>
                        <TrendingUpIcon className="h-3 w-3" />
                        {stat.change} từ tháng trước
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-full`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color.replace("text-", "bg-")}`} />
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-2xl font-bold text-slate-900">Biểu đồ doanh thu</CardTitle>

              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={type} onChange={(value: TimeType) => setType(value)} className="w-full sm:w-40">
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                  <option value="year">Theo năm</option>
                </Select>

                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <BarChartIcon className="h-5 w-5 text-blue-600" />
                    Biểu đồ cột doanh thu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <BarChart data={chartData} />
                  )}
                </CardContent>
              </Card>

              <Card className="border border-slate-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <TrendingUpIcon className="h-5 w-5 text-green-600" />
                    Biểu đồ đường xu hướng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                  ) : (
                    <LineChart data={chartData} />
                  )}
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminStatistics
