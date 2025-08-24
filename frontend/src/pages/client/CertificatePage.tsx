import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCertificate } from "../../services/certificateService";
import { Spin, Alert, Button } from "antd";
import CertificatePreview from "../../components/CertificatePreview";

const CertificatePage: React.FC = () => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    getCertificate(courseId)
      .then((cert) => setCertificate(cert))
      .catch((err) => setError("Không tìm thấy chứng chỉ hoặc bạn chưa hoàn thành khóa học!"))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error} />;

  const handleDownloadCertificate = async () => {
    if (!certificate?.file) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để tải chứng chỉ!');
      return;
    }
    try {
      const res = await fetch(`/api/certificates/download/${certificate.file}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        alert('Không thể tải chứng chỉ!');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = certificate.file;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Có lỗi khi tải chứng chỉ!');
    }
  };

  // Xem trước chứng chỉ PDF
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handlePreviewCertificate = async () => {
    if (!certificate?.file) return;
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Bạn cần đăng nhập để xem chứng chỉ!');
      return;
    }
    try {
      const res = await fetch(`/api/certificates/download/${certificate.file}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Certificate preview error:', res.status, errorData);
        alert(`Không thể xem trước chứng chỉ! Lỗi: ${errorData.message || res.statusText}`);
        return;
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        alert('File chứng chỉ trống hoặc không hợp lệ!');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Certificate preview error:', err);
      alert('Có lỗi khi xem trước chứng chỉ! Vui lòng thử lại sau.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 16 }}>
      <h2>Chứng chỉ hoàn thành khóa học</h2>
      {certificate && (
  <div style={{ marginTop: 24 }}>
    <CertificatePreview
      certificate={{
        code: certificate.code,
        issuedAt: new Date(certificate.issuedAt).toLocaleDateString(),
        learnerName: certificate.name || "Tên học viên",
        courseName: certificate.courseName || "Khóa học",
      }}
    />
  </div>
)}

      <p><b>Mã chứng chỉ:</b> {certificate.code}</p>
      <p><b>Ngày cấp:</b> {new Date(certificate.issuedAt).toLocaleDateString()}</p>
      {certificate.file && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <Button type="primary" onClick={handleDownloadCertificate}>
            Tải chứng chỉ PDF
          </Button>
          <Button onClick={handlePreviewCertificate}>
            Xem trước
          </Button>
        </div>
      )}
      {previewUrl && (
        <iframe
          src={previewUrl}
          title="Xem trước chứng chỉ"
          width="100%"
          height={600}
          style={{ border: '1px solid #ccc', borderRadius: 8, marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default CertificatePage; 