const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const certificateController = require('../controllers/certificate.controller');

console.log('Certificate routes loaded');

router.use(auth);

// Cấp chứng chỉ khi hoàn thành khóa học
router.post('/:courseId/issue', (req, res, next) => {
  console.log('ĐÃ VÀO ROUTE POST /:courseId/issue');
  next();
}, certificateController.issueCertificate);

// Lấy chứng chỉ của user cho một khóa học
router.get('/:courseId', certificateController.getCertificate);

// Lấy thông tin chi tiết chứng chỉ với đầy đủ thông tin
router.get('/:courseId/details', certificateController.getCertificateDetails);

// Lấy danh sách tất cả chứng chỉ của user
router.get('/user/all', certificateController.getUserCertificates);

// Tải file PDF chứng chỉ
router.get('/download/:fileName', certificateController.downloadCertificate);

module.exports = router; 