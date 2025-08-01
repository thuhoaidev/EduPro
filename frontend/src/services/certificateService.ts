import { config } from '../api/axios';

export const issueCertificate = (courseId: string) =>
  config.post(`/certificates/${courseId}/issue`).then(res => res.data.data);

export const getCertificate = (courseId: string) =>
  config.get(`/certificates/${courseId}`).then(res => res.data.data); 