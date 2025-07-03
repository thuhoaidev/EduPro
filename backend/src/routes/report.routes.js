const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');

// USER
router.post('/', reportController.createReport); // Gửi báo cáo
router.get('/my-reports/:userId', reportController.getReportsByUser); // Lấy báo cáo của user

// ADMIN
router.get('/', reportController.getAllReports); // Admin lấy tất cả
router.put('/:id/reply', reportController.replyToReport); // Admin trả lời

module.exports = router;
