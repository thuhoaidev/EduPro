import { config } from "../api/axios";

export const fetchComments = () =>
    config.get("/blogs/comments/all");

export const fetchPublicComments = () =>
    config.get("/blogs/comments/public");

export const updateCommentStatus = (id: string, status: "approved" | "hidden" | "pending") =>
    config.put(`/comments/${id}/approve-or-hide`, { status });

export const deleteComment = (id: string) =>
    config.delete(`/comments/${id}`);

export const fetchBlogComments = (blogId: string) =>
    config.get(`/blogs/${blogId}/comments`); 