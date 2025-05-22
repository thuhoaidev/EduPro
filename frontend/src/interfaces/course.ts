// Định nghĩa các interface cho khóa học
export interface Course {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string;
  full_description: string;
  requirement: string;
  learning_outcomes: string[];
  language: string;
  price: number;
  is_free: boolean;
  has_trial: boolean;
  trial_duration: number;
  level: string;
  total_duration: number;
  total_lectures: number;
  total_students: number;
  thumbnail_url: string;
  intro_video_url?: string;
  created_by: number;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface CourseCategory {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  created_at: string;
}

export interface CourseSection {
  id: number;
  course_id: number;
  title: string;
  description: string;
  order_number: number;
}

export interface CourseLesson {
  id: number;
  section_id: number;
  title: string;
  content: string;
  order_number: number;
} 