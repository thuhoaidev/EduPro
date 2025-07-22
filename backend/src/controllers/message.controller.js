const Message = require('../models/Message');
const User = require('../models/User');

// Gửi tin nhắn
exports.sendMessage = async (req, res) => {
    try {
        console.log('=== SEND MESSAGE DEBUG ===');
        console.log('Request body:', req.body);
        console.log('User from token:', req.user);
        
        const { receiverId, content } = req.body;
        const senderId = req.user._id;
        
        console.log('Extracted data:', { receiverId, content, senderId });
        
        // Kiểm tra dữ liệu đầu vào chi tiết hơn
        if (!receiverId) {
            console.log('ERROR: receiverId is missing');
            return res.status(400).json({ 
                success: false, 
                message: 'receiverId là bắt buộc',
                debug: { receiverId, content, senderId }
            });
        }
        
        if (!content || content.trim() === '') {
            console.log('ERROR: content is missing or empty');
            return res.status(400).json({ 
                success: false, 
                message: 'Nội dung tin nhắn không được để trống',
                debug: { receiverId, content, senderId }
            });
        }
        
        if (!senderId) {
            console.log('ERROR: senderId is missing (user not authenticated)');
            return res.status(401).json({ 
                success: false, 
                message: 'Người dùng chưa được xác thực',
                debug: { receiverId, content, senderId }
            });
        }
        
        // Kiểm tra xem receiver có tồn tại không
        const receiverExists = await User.findById(receiverId);
        if (!receiverExists) {
            console.log('ERROR: Receiver not found:', receiverId);
            return res.status(404).json({ 
                success: false, 
                message: 'Người nhận không tồn tại',
                debug: { receiverId, content, senderId }
            });
        }
        
        console.log('Creating message with data:', { sender: senderId, receiver: receiverId, content });
        const message = await Message.create({ 
            sender: senderId, 
            receiver: receiverId, 
            content: content.trim() 
        });
        
        console.log('Message created successfully:', message);
        res.status(201).json({ success: true, data: message });
    } catch (err) {
        console.error('ERROR in sendMessage:', err);
        res.status(500).json({ 
            success: false, 
            message: err.message,
            debug: {
                receiverId: req.body?.receiverId,
                content: req.body?.content,
                senderId: req.user?._id
            }
        });
    }
};

// Lấy tin nhắn giữa 2 user
exports.getMessages = async (req, res) => {
    try {
        console.log('=== GET MESSAGES DEBUG ===');
        console.log('User from auth middleware:', req.user);
        console.log('Params:', req.params);
        
        const userId = req.user._id;
        const { otherUserId } = req.params;
        
        console.log('Getting messages between:', { userId, otherUserId });
        
        if (!userId) {
            console.log('ERROR: userId is missing from req.user');
            return res.status(401).json({ 
                success: false, 
                message: 'Người dùng chưa được xác thực' 
            });
        }
        
        if (!otherUserId) {
            console.log('ERROR: otherUserId is missing from params');
            return res.status(400).json({ 
                success: false, 
                message: 'Thiếu thông tin người nhận' 
            });
        }
        
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ createdAt: 1 });
        
        console.log(`Found ${messages.length} messages`);
        res.json({ success: true, data: messages });
    } catch (err) {
        console.error('ERROR in getMessages:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// Đánh dấu đã đọc
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;
        await Message.updateMany({ sender: otherUserId, receiver: userId, read: false }, { $set: { read: true } });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}; 