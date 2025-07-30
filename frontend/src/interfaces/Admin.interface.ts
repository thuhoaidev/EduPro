// ✅ user.interface.ts

export enum UserRole {
  ADMIN = "admin",
  INSTRUCTOR = "instructor",
  STUDENT = "student",
  MODERATOR = "moderator"
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive"
}

// API User interface (matches backend response)
export interface ApiUser {
  _id: string;
  name?: string;
  fullname?: string;
  email: string;
  avatar?: string;
  role_id: string | Role;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: string;
  approval_status: string;
  email_verified: boolean;
  description?: string;
  coursesCount?: number;
}

// Frontend User interface (used in components)
export interface Role {
  _id: string;
  name: UserRole;
}

export interface User {
  id: string | number;
  fullname: string;
  name?: string;
  email: string;
  avatar?: string;
  role_id: string | UserRole | Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  phone?: string;
  address?: string;
  dob?: string | null;
  gender?: string;
  approval_status?: string;
  email_verified?: boolean;
  description?: string;
  coursesCount?: number;
  number?: number;
}

export interface UserQueryParams {
  q?: string;
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: UserStatus;
  startDate?: string;
  endDate?: string;
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
  fullname: string;
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
  avatar:string;
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
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  users: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
