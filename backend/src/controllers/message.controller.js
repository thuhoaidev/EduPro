const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

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
        const { messageId } = req.params;
        const userId = req.user._id;
        
        await Message.findByIdAndUpdate(messageId, { read: true });
        
        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy số tin nhắn chưa đọc
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const unreadCount = await Message.countDocuments({
            receiver: userId,
            read: false
        });
        
        res.json({ 
            success: true, 
            count: unreadCount 
        });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Lấy số tin nhắn chưa đọc từ một người cụ thể
exports.getUnreadCountFromUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const { senderId } = req.params;
        
        const unreadCount = await Message.countDocuments({
            receiver: userId,
            sender: senderId,
            read: false
        });
        
        res.json({ 
            success: true, 
            count: unreadCount 
        });
    } catch (error) {
        console.error('Error getting unread count from user:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Lấy cuộc trò chuyện với một người
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { otherUserId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('sender', 'fullname avatar')
        .populate('receiver', 'fullname avatar');
        
        res.json({ 
            success: true, 
            data: messages.reverse() // Reverse để tin nhắn cũ nhất ở đầu
        });
    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// Lấy danh sách người đã nhắn tin (bao gồm cả người lạ)
exports.getConversationList = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Lấy tất cả tin nhắn liên quan đến user hiện tại
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: new mongoose.Types.ObjectId(userId) },
                        { receiver: new mongoose.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
                            '$receiver',
                            '$sender'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$receiver', new mongoose.Types.ObjectId(userId)] },
                                        { $eq: ['$isRead', false] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    from: 'follows',
                    let: { userId: new mongoose.Types.ObjectId(userId), otherId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$follower', '$$userId'] },
                                        { $eq: ['$following', '$$otherId'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'followInfo'
                }
            },
            {
                $project: {
                    _id: '$user._id',
                    fullname: '$user.fullname',
                    avatar: '$user.avatar',
                    lastMessage: '$lastMessage',
                    unreadCount: '$unreadCount',
                    isFollowing: { $gt: [{ $size: '$followInfo' }, 0] },
                    lastMessageTime: '$lastMessage.createdAt'
                }
            },
            {
                $sort: {
                    unreadCount: -1,
                    lastMessageTime: -1
                }
            }
        ]);
        
        res.json({ 
            success: true, 
            data: conversations 
        });
    } catch (error) {
        console.error('Error getting conversation list:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};