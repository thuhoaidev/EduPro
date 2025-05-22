// Redux slice cho quản lý trạng thái khóa học
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Course, CourseCategory } from '@interfaces/course';

interface CourseState {
  courses: Course[];
  categories: CourseCategory[];
  selectedCourse: Course | null;
  loading: boolean;
  error: string | null;
}

const initialState: CourseState = {
  courses: [],
  categories: [],
  selectedCourse: null,
  loading: false,
  error: null,
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    fetchCoursesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchCoursesSuccess: (state, action: PayloadAction<Course[]>) => {
      state.loading = false;
      state.courses = action.payload;
    },
    fetchCoursesFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedCourse: (state, action: PayloadAction<Course>) => {
      state.selectedCourse = action.payload;
    },
    fetchCategoriesSuccess: (state, action: PayloadAction<CourseCategory[]>) => {
      state.categories = action.payload;
    },
  },
});

export const {
  fetchCoursesStart,
  fetchCoursesSuccess,
  fetchCoursesFailure,
  setSelectedCourse,
  fetchCategoriesSuccess,
} = courseSlice.actions;

export default courseSlice.reducer; 