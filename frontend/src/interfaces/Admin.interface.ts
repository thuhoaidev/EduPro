// ------------------------------
// User Roles & Status
// ------------------------------
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

// ------------------------------
// Approval Status (dùng chung cho duyệt giảng viên, nội dung...)
export const ApprovalStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ApprovalStatus = (typeof ApprovalStatus)[keyof typeof ApprovalStatus];

// ------------------------------
// Instructor Profile
// ------------------------------
export interface InstructorProfile {
  id: number;
  user_id: number;
  bio: string;
  expertise: string;
  rating: number;
  status: ApprovalStatus; // Sử dụng ApprovalStatus thay vì chuỗi trực tiếp
  created_at: string;
}

export interface InstructorEarnings {
  id: number;
  instructor_id: number;
  total_earnings: number;
  last_payout_date: string;
}

export interface EarningTransaction {
  id: number;
  instructor_id: number;
  amount: number;
  type: 'income' | 'withdrawal' | 'adjustment';
  description: string;
  created_at: string;
}

export interface InstructorDetail {
  id: number;
  fullName: string;
  email: string;
  avatar: string;
  status: UserStatus; // dùng lại UserStatus
  createdAt: string;
  bio: string;
  phone: string;
  gender: "Nam" | "Nữ" | "Khác";
}

// ------------------------------
// Content Item
// ------------------------------
export interface ContentItem {
  id: number;
  title: string;
  authorName: string;
  status: ApprovalStatus;
  createdAt: string;
}

// ------------------------------
// Report
// ------------------------------
export type ReportStatus = "pending" | "resolved";

export interface ReportItem {
  id: number;
  title: string;
  description: string;
  reporterName: string;
  status: ReportStatus;
  createdAt: string;
}

// ------------------------------
// Coupon / Voucher
// ------------------------------
export interface Coupon {
  key: string;
  code: string;
  courseApplied: string; // Tên khóa học áp dụng (hoặc "Tất cả")
  type: "amount" | "percentage";
  value: number;
  usedCount: number;
  quantity: number;
  createdAt: string;
  expiresAt: string;
}

// ------------------------------
// Notification
// ------------------------------
export type NotificationStatus = "unread" | "read";

export interface Notification {
  id: number;
  title: string;
  content: string;
  status: NotificationStatus;
  createdAt: string;
  userId?: number;
  notifyTime?: string;
}
