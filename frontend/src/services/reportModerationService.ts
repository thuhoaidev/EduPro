import { config } from "../api/axios";

export const fetchReports = (status?: string) =>
    config.get("/reports", { params: status ? { status } : {} });

export const markReportResolved = (id: number) =>
    config.put(`/reports/${id}/resolve`); 