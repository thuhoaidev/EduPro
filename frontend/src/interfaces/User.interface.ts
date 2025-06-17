export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    BANNED = 'banned'
}

export enum UserRole {
    ADMIN = 'admin',
    MODERATOR = 'moderator',
    INSTRUCTOR = 'instructor',
    STUDENT = 'student'
}

export interface Role {
    _id: string;
    name: string;
}

export interface User {
    _id: string;
    id?: string;
    name: string;
    fullname?: string;
    email: string;
    nickname: string;
    slug: string;
    role_id: string;
    role?: Role;
    status: UserStatus;
    avatar?: string;
    phone?: string;
    address?: string;
    dob?: string;
    gender?: string;
    approval_status: 'pending' | 'approved' | 'rejected';
    email_verified: boolean;
    created_at: string;
    updated_at: string;
    createdAt?: string;
    updatedAt?: string;
    description?: string;
    coursesCount?: number;
}

export interface CreateUserData {
    name: string;
    email: string;
    nickname?: string;
    password: string;
    role_id: string;
    status?: UserStatus;
    phone?: string;
    address?: string;
    dob?: string;
    gender?: string;
    approval_status?: 'pending' | 'approved' | 'rejected';
    email_verified?: boolean;
} 