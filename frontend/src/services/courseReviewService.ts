import axios from '../api/axios';

export const addOrUpdateReview = (courseId: string, rating: number, comment: string) =>
  axios.post(`/course-reviews/${courseId}/review`, { rating, comment }).then(res => res.data.data);

export const getCourseReviews = (courseId: string) =>
  axios.get(`/course-reviews/${courseId}/reviews`).then(res => res.data.data);

export const getMyReview = async (courseId: string): Promise<{ rating: number; comment: string } | null> => {
  try {
    const res = await axios.get(`/course-reviews/${courseId}/my-review`);
    return res.data.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null; // Trả về null nếu không tìm thấy review
    }
    throw error; // Ném lại các lỗi khác
  }
};

// Toggle like a review
export const toggleLikeReview = async (reviewId: string) => {
  const res = await axios.post(`/course-reviews/${reviewId}/like`);
  return res.data;
};

// Toggle dislike a review
export const toggleDislikeReview = async (reviewId: string) => {
  const res = await axios.post(`/course-reviews/${reviewId}/dislike`);
  return res.data;
};

// Report a review
export const reportReview = async (reviewId: string, reason: string) => {
  const res = await axios.post(`/course-reviews/${reviewId}/report`, { reason });
  return res.data;
}; 