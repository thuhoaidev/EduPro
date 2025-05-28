// ✅ user.interface.ts

export const UserRole = {
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
  MODERATOR: "moderator",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  BANNED: "banned",
} as const;

export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export interface User {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  address?: string;
  description?: string; // mô tả nếu là giảng viên
  coursesCount?: number;
}

export interface UserQueryParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface UpdateUserRolePayload {
  userId: number;
  role: UserRole;
}

export interface UpdateUserStatusPayload {
  userId: number;
  status: UserStatus;
}



// Content approval status enum
export const ApprovalStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

// Content item interface
export type ContentStatus = "pending" | "approved" | "rejected";

export interface ContentItem {
  id: number;
  title: string;
  authorName: string;
  status: ContentStatus;
  createdAt: string;
}


// Repor
export type ReportStatus = "pending" | "resolved";

export interface ReportItem {
  description: string;
  id: number;
  title: string;
  reporterName: string;
  status: ReportStatus;
  createdAt: string;
}


// Voucher
export interface Coupon {
  key: string;
  code: string;
  courseApplied: string; // Tên khóa học áp dụng (hoặc "Tất cả")
  type: 'amount' | 'percentage'; // Loại giảm giá: số tiền hay phần trăm
  value: number; // Giá trị giảm giá
  usedCount: number; // Số lượng đã sử dụng
  quantity: number; // Tổng số lượng
  createdAt: string; // Ngày tạo, định dạng YYYY-MM-DD
  expiresAt: string; // Ngày hết hạn, định dạng YYYY-MM-DD
}


//instructor :  Giáo viênviên
export interface InstructorProfile {
  id: number;
  user_id: number;           // id người dùng liên kết
  bio: string;
  expertise: string;
  rating: number;            
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;        // ISO date string hoặc Date tùy project
}

export interface InstructorEarnings {
  id: number;
  instructor_id: number;     // liên kết tới InstructorProfile.id
  total_earnings: number;    // decimal có thể dùng number
  last_payout_date: string;  // ISO date string hoặc Date
}

export interface EarningTransaction {
  id: number;
  instructor_id: number;
  amount: number;            // decimal, số tiền giao dịch
  type: 'income' | 'withdrawal' | 'adjustment'; // enum giao dịch
  description: string;
  created_at: string;        // ISO date string hoặc Date
}

export interface InstructorDetail {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  status: "active" | "inactive" | "banned";
  createdAt: string;
  bio: string;
  phone: string;
  gender: "Nam" | "Nữ" | "Khác";
}


//Notification
export type NotificationStatus = "unread" | "read";

export interface Notification {
  id: number;
  title: string;
  content: string;
  status: NotificationStatus;
  createdAt: string; // ISO date string
  userId?: number; // Nếu notification liên quan user cụ thể
  notifyTime?: string;
}
