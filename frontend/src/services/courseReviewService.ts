import axios from '../api/axios';

export const addOrUpdateReview = (courseId: string, rating: number, comment: string) =>
  axios.post(`/course-reviews/${courseId}/review`, { rating, comment }).then(res => res.data.data);

export const getCourseReviews = (courseId: string) =>
  axios.get(`/course-reviews/${courseId}/reviews`).then(res => res.data.data);

export const getMyReview = (courseId: string) =>
  axios.get(`/course-reviews/${courseId}/my-review`).then(res => res.data.data); 