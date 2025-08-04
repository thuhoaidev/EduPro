// src/components/CertificatePreview.tsx
import React from "react";

interface CertificateProps {
  certificate: {
    learnerName: string;
    courseName: string;
    issuedAt: string;
    code: string;
  };
}

const CertificatePreview: React.FC<CertificateProps> = ({ certificate }) => {
  return (
    <div
      style={{
        position: "relative",
        width: "1123px",
        height: "794px",
        backgroundImage: "url('/images/certificate.png')", // dùng file mới
        backgroundSize: "cover",
        fontFamily: "Georgia, serif",
        border: "1px solid #ccc",
        boxShadow: "0 0 12px rgba(0,0,0,0.2)",
        margin: "0 auto"
      }}
    >
      {/* Tên học viên */}
      <div
        style={{
          position: "absolute",
          top: "360px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "36px",
          fontWeight: 600,
          color: "#2c3e50",
          textShadow: "1px 1px 2px rgba(0,0,0,0.2)",
        }}
      >
        {certificate.learnerName}
      </div>

      {/* Tên khóa học */}
      <div
        style={{
          position: "absolute",
          top: "420px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "24px",
          color: "#34495e",
        }}
      >
        {certificate.courseName}
      </div>

      {/* Ngày cấp */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: "140px",
          fontSize: "16px",
          color: "#555",
        }}
      >
        Ngày cấp: {certificate.issuedAt}
      </div>

      {/* Mã chứng chỉ */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          right: "140px",
          fontSize: "16px",
          color: "#555",
        }}
      >
        Mã số: {certificate.code}
      </div>
    </div>
  );
};


export default CertificatePreview;
