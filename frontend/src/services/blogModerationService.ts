import { config } from "../api/axios";

export const fetchBlogs = (status?: string) =>
    config.get("/blogs", { params: status ? { status } : {} });

export const updateBlogStatus = (id: string, status: "approved" | "hidden" | "rejected", rejected_reason?: string) =>
    config.patch(`/blogs/${id}/approve-reject`, { status, rejected_reason });

export const fetchPendingBlogs = () => config.get("/blogs/pending/all"); 