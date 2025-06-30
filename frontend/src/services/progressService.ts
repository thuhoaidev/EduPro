import axios from '../api/axios';

export const getProgress = (courseId: string) =>
  axios.get(`/progress/${courseId}/progress`).then(res => res.data.data);

export const updateProgress = (courseId: string, lessonId: string, data: { watchedSeconds: number; videoDuration: number; quizPassed: boolean }) =>
  axios.post(`/progress/${courseId}/progress/${lessonId}`, data).then(res => res.data.data);

export const getUnlockedLessons = (courseId: string) =>
  axios.get(`/progress/${courseId}/unlocked-lessons`).then(res => res.data.data); 