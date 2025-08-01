import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { config } from "../../../api/axios";
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Download, Award, Calendar, User, BookOpen } from "lucide-react";

interface Certificate {
  id: string;
  certificateNumber: string;
  code: string;
  issuedAt: string;
  file: string;
  fileUrl: string;
  templateUsed: string;
  issuingUnit: string;
  instructorName: string;
  course: {
    title: string;
    thumbnail: string;
    instructor: string;
  };
}

const Certificates = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const response = await config.get('/certificates/user/all');
        setCertificates(response.data.data || []);
        setError(null);
      } catch (error: any) {
        console.error('Error fetching certificates:', error);
        setError(error.response?.data?.message || 'Không thể tải danh sách chứng chỉ');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  const handleDownload = async (certificate: Certificate) => {
    try {
      const response = await config.get(`/certificates/download/${certificate.file}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate_${certificate.certificateNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Không thể tải chứng chỉ');
    }
  };

  if (loading) {
    return (
      <motion.div
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex flex-col items-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p
            className="mt-4 text-gray-600 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Đang tải chứng chỉ...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-center">
            <motion.div
              className="text-2xl text-red-500 mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: 2 }}
            >
              ⚠️
            </motion.div>
            <div className="text-xl text-red-600 mb-4 font-semibold">{error}</div>
            <motion.button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Thử lại
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-6"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Award className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Chứng Chỉ Của Tôi
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Danh sách các chứng chỉ bạn đã nhận sau khi hoàn thành khóa học
              </p>
            </motion.div>

        {/* Certificates Grid */}
        {certificates.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Award className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-600 mb-4">
              Chưa có chứng chỉ nào
            </h3>
            <p className="text-gray-500 mb-8">
              Hoàn thành khóa học để nhận chứng chỉ đầu tiên của bạn
            </p>
            <motion.button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Quay lại
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {certificates.map((certificate, index) => (
              <motion.div
                key={certificate.id}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                {/* Certificate Header */}
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Award className="w-6 h-6" />
                      <span className="font-semibold text-lg">Chứng Chỉ</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-90">Số chứng chỉ</div>
                      <div className="font-bold">{certificate.certificateNumber}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm opacity-90 mb-1">Mã xác thực</div>
                    <div className="font-mono text-lg font-bold">{certificate.code}</div>
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="p-6">
                  {/* Course Info */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                      <h3 className="font-bold text-lg text-gray-900 truncate" title={certificate.course.title}>
                        {certificate.course.title}
                      </h3>
                    </div>
                    {certificate.course.thumbnail && (
                      <img
                        src={certificate.course.thumbnail}
                        alt={certificate.course.title}
                        className="w-full h-32 object-cover rounded-lg mb-4"
                      />
                    )}
                  </div>

                  {/* Certificate Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm">
                        <span className="font-semibold">Giảng viên:</span> {certificate.instructorName}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        <span className="font-semibold">Ngày cấp:</span> {format(new Date(certificate.issuedAt), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Award className="w-4 h-4" />
                      <span className="text-sm">
                        <span className="font-semibold">Đơn vị cấp:</span> {certificate.issuingUnit}
                      </span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <motion.button
                    onClick={() => handleDownload(certificate)}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Download className="w-5 h-5" />
                    Tải Chứng Chỉ
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
      </div>
    </motion.div>
  );
};

export default Certificates; 