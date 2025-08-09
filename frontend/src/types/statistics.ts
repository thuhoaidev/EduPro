export interface StatisticsData {
  totalUsers: number;
  totalCourses: number;
  totalRevenue: number;
  totalOrders: number;
  newUsersToday: number;
  newCoursesToday: number;
  revenueToday: number;
  ordersToday: number;
  userGrowth: number;
  courseGrowth: number;
  revenueGrowth: number;
  orderGrowth: number;
}



export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategoryStat {
  _id: string;
  categoryName: string;
  courseCount: number;
  totalEnrollments: number;
  totalRevenue: number;
}

export interface MonthlyStat {
  month: number;
  revenue: number;
  orders: number;
} 