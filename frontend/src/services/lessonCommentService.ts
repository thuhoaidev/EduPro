import { config } from '../api/axios';

export const getComments = (lessonId: string) =>
  config.get(`/lesson-comments/${lessonId}/comments`).then(res => res.data.data);

export const addComment = (lessonId: string, content: string) =>
  config.post(`/lesson-comments/${lessonId}/comment`, { content }).then(res => res.data);

export const replyComment = (commentId: string, content: string) =>
  config.post(`/lesson-comments/comment/${commentId}/reply`, { content }).then(res => res.data.data); 