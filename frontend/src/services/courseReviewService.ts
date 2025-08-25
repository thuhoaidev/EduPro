import { config } from '../api/axios';
import axios from 'axios';

export const addOrUpdateReview = async (courseId: string, rating: number, comment: string) => {
  try {
    const response = await config.post(`/course-reviews/${courseId}/review`, { rating, comment });
    console.log('Review response:', response.data); // Debug log
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error adding/updating review:', error);
    throw error;
  }
};

export const getCourseReviews = (courseId: string) =>
  axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/course-reviews/${courseId}/reviews`)
    .then(res => res.data.data || [])
    .catch(error => {
      console.error('Error fetching course reviews:', error);
      return [];
    });

export const getMyReview = async (courseId: string) => {
  try {
    const res = await config.get(`/course-reviews/${courseId}/my-review`);
    return res.data.data;
  } catch (e: any) {
    if (e?.response?.status === 404) return null;
    // Chỉ log các lỗi khác 404
    console.error(e);
    throw e;
  }
};

// Toggle like a review
export const toggleLikeReview = async (reviewId: string) => {
  const res = await config.post(`/course-reviews/${reviewId}/like`);
  return res.data;
};

// Toggle dislike a review
export const toggleDislikeReview = async (reviewId: string) => {
  const res = await config.post(`/course-reviews/${reviewId}/dislike`);
  return res.data;
};

// Report a review
export const reportReview = async (reviewId: string, reason: string) => {
  const res = await config.post(`/course-reviews/${reviewId}/report`, { reason });
  return res.data;
}; 