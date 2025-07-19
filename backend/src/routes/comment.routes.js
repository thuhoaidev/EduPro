const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const BlogComment = require('../models/BlogComment');

// Xóa bình luận
router.delete('/:id', auth, async (req, res) => {
    try {
        await BlogComment.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa bình luận.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi xóa bình luận.' });
    }
});

// Ẩn/duyệt bình luận
router.put('/:id/approve-or-hide', auth, async (req, res) => {
    try {
        const { status } = req.body; // status: 'approved' | 'hidden'
        await BlogComment.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true, message: 'Cập nhật trạng thái bình luận thành công.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái.' });
    }
});

module.exports = router; 