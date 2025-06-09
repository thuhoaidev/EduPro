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

// API User interface (matches backend response)
export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role_id: {
    _id: string;
    name: UserRole;
  };
  status: UserStatus;
  created_at: string;
  updated_at?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  approval_status?: 'approved' | 'pending' | 'rejected';
  email_verified?: boolean;
  description?: string;
  coursesCount?: number;
}

// Frontend User interface (used in components)
export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
  phone?: string;
  address?: string;
  description?: string;
  coursesCount?: number;
  gender?: string;
  dob?: string;
  approval_status?: 'approved' | 'pending' | 'rejected';
  email_verified?: boolean;
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
// export interface InstructorApprovalProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   bio: string;
//   avatarUrl?: string;
//   gender: "Nam" | "Nữ" | "Khác";
//   status: 'pending' | 'approved' | 'rejected';
//   education: {
//     degree: string;
//     field: string;
//     institution: string;
//     year: number;
//     description: string;
//     _id: string;
//   }[];
//   experience: {
//     position: string;
//     company: string;
//     startDate: string; // ISO format string
//     endDate: string;   // ISO format string
//     description: string;
//     _id: string;
//   }[];
// }



//Notification

export interface InstructorApprovalProfile {
  _id: string;
  name: string;
  email: string;
  approval_status: string;
  instructorInfo?: {
    bio?: string;
    gender?: string;
    phone?: string;
    education?: {
      degree?: string;
      field?: string;
      institution?: string;
      year?: number;
      description?: string;
    }[];
    experience?: {
      position?: string;
      company?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }[];
  };
}


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

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse {
  users: ApiUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
