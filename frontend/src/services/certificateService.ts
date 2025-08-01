import { config } from '../api/axios';

export const issueCertificate = (courseId: string) =>
  axios.post(`/certificates/${courseId}/issue`).then(res => res.data.data);

export const getCertificate = (courseId: string) =>
  axios.get(`/certificates/${courseId}`).then(res => res.data.data); 