import axios from '../api/axios';

export const getProgress = (courseId: string) =>
  axios.get(`/progress/${courseId}/progress`).then(res => res.data.data);

export const updateProgress = (courseId: string, lessonId: string, data: { watchedSeconds: number; videoDuration: number; quizPassed: boolean; quizAnswers?: number[] }) =>
  axios.post(`/progress/${courseId}/progress/${lessonId}`, data).then(res => res.data.data);

export const getUnlockedLessons = (courseId: string) =>
  axios.get(`/progress/${courseId}/unlocked-lessons`).then(res => res.data.data);

export const getVideoProgress = (courseId: string, lessonId: string): Promise<{ watchedSeconds: number }> =>
  axios.get(`/progress/${courseId}/lessons/${lessonId}/progress`).then(res => res.data.data);

export const updateVideoProgress = (courseId: string, lessonId: string, currentTime: number, videoDuration?: number) =>
  axios.post(`/progress/${courseId}/lessons/${lessonId}/progress`, videoDuration !== undefined ? { currentTime, videoDuration } : { currentTime });

export const markCourseCompleted = (courseId: string) =>
  axios.post(`/progress/${courseId}/complete`).then(res => res.data); 