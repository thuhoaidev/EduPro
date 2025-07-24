const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const certificateController = require('../controllers/certificate.controller');

router.use(auth);

// Cấp chứng chỉ khi hoàn thành khóa học
router.post('/:courseId/issue', certificateController.issueCertificate);
// Lấy chứng chỉ của user cho một khóa học
router.get('/:courseId', certificateController.getCertificate);
// Tải file PDF chứng chỉ
router.get('/download/:fileName', certificateController.downloadCertificate);

module.exports = router; 