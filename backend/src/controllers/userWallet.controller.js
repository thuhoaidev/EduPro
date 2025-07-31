const UserWallet = require('../models/UserWallet');
const axios = require('axios');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const UserWalletDeposit = require('../models/UserWalletDeposit');
const UserWithdrawRequest = require('../models/UserWithdrawRequest');

// Lấy số dư và lịch sử giao dịch
exports.getWallet = async (req, res) => {
  try {
    let wallet = await UserWallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await UserWallet.create({ userId: req.user._id });
    }
    res.json({ success: true, balance: wallet.balance, history: wallet.history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy ví', error: err.message });
  }
};

// Tạo yêu cầu nạp tiền
exports.createDeposit = async (req, res) => {
  try {
    const { amount, method, callbackUrl } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
    if (!['momo', 'vnpay', 'zalopay'].includes(method)) return res.status(400).json({ success: false, message: 'Phương thức không hợp lệ' });

    // Tạo mã giao dịch duy nhất
    const depositId = `${req.user._id}_${Date.now()}`;
    let payUrl = '';

    // Sử dụng callbackUrl từ request hoặc fallback về URL mặc định
    const redirectUrl = callbackUrl || "http://localhost:5173/wallet/payment-result";

    if (method === 'momo') {
      // Momo config
      const momoConfig = {
        partnerCode: "MOMO",
        accessKey: "F8BBA842ECF85",
        secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
        requestType: "captureWallet",
        endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
        redirectUrl: `${redirectUrl}?paymentMethod=momo`,
        ipnUrl: "http://localhost:5000/api/wallet/momo-callback",
      };
      const orderId = depositId;
      const requestId = orderId;
      const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=&ipnUrl=${momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=Nap tien vao vi&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=${momoConfig.requestType}`;
      const signature = CryptoJS.HmacSHA256(rawSignature, momoConfig.secretKey).toString();
      const body = {
        partnerCode: momoConfig.partnerCode,
        accessKey: momoConfig.accessKey,
        requestId,
        amount,
        orderId,
        orderInfo: "Nap tien vao vi",
        redirectUrl: momoConfig.redirectUrl,
        ipnUrl: momoConfig.ipnUrl,
        extraData: "",
        requestType: momoConfig.requestType,
        signature,
        lang: "vi",
      };
      const momoRes = await axios.post(momoConfig.endpoint, body);
      payUrl = momoRes.data.payUrl;
    } else if (method === 'vnpay') {
      // VNPAY config giống đơn hàng, chỉ khác orderInfo và returnUrl
      const vnpConfig = {
        tmnCode: "NXQHNEYW",
        secretKey: "K7RFK8JIMPMJIXYFPKMCG59N6KFN3DN4",
        vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        returnUrl: `${redirectUrl}?paymentMethod=vnpay`,
      };
      const crypto = require("crypto");
      const ipAddr = "127.0.0.1";
      const orderId = depositId;
      const createDate = moment().format("YYYYMMDDHHmmss");
      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: vnpConfig.tmnCode,
        vnp_Amount: (parseInt(amount, 10) * 100).toString(),
        vnp_CreateDate: createDate,
        vnp_CurrCode: "VND",
        vnp_IpAddr: ipAddr,
        vnp_Locale: "vn",
        vnp_OrderInfo: "Nạp tiền vào ví", // khác đơn hàng
        vnp_OrderType: "other",
        vnp_ReturnUrl: vnpConfig.returnUrl,
        vnp_TxnRef: orderId,
      };
      vnp_Params = Object.keys(vnp_Params).sort().reduce((r, k) => (r[k] = vnp_Params[k], r), {});
      const signData = Object.entries(vnp_Params).map(([k, v]) => `${k}=${v}`).join('&');
      const hmac = crypto.createHmac("sha512", vnpConfig.secretKey);
      const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
      vnp_Params["vnp_SecureHash"] = signed;
      const queryString = Object.entries(vnp_Params).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
      payUrl = vnpConfig.vnp_Url + "?" + queryString;
    } else if (method === 'zalopay') {
      // ZaloPay config giống đơn hàng, chỉ khác description và callback_url
      const zaloConfig = {
        app_id: "2553",
        key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
        key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
        endpoint: "https://sb-openapi.zalopay.vn/v2/create",
      };
      const transID = Math.floor(Math.random() * 1000000);
      const items = [{}];
      const embed_data = {
        return_url: `${redirectUrl}?paymentMethod=zalopay`,
        redirecturl: `${redirectUrl}?paymentMethod=zalopay`
      };
      const app_trans_id = `${moment().format("YYMMDD")}_${transID}`;
      const order = {
        app_id: zaloConfig.app_id,
        app_trans_id,
        app_user: req.user._id.toString(),
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount: amount,
        description: "Nạp tiền vào ví", // khác đơn hàng
        bank_code: "",
        callback_url: "http://localhost:5000/api/wallet/zalopay-callback",
      };
      const data =
        zaloConfig.app_id +
        "|" +
        order.app_trans_id +
        "|" +
        order.app_user +
        "|" +
        order.amount +
        "|" +
        order.app_time +
        "|" +
        order.embed_data +
        "|" +
        order.item;
      order.mac = CryptoJS.HmacSHA256(data, zaloConfig.key1).toString();
      const response = await axios.post(zaloConfig.endpoint, null, { params: order });
      payUrl = response.data.order_url;
      // Lưu mapping app_trans_id <-> userId vào DB tạm
      await UserWalletDeposit.create({ app_trans_id, userId: req.user._id, amount });
    }

    res.json({ success: true, payUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi tạo yêu cầu nạp tiền', error: err.message });
  }
};

// Callback/payment result cho Momo
exports.handlePaymentResult = async (req, res) => {
  try {
    // Momo gửi callback qua query parameters, không phải body
    const resultCode = req.query.resultCode || req.body.resultCode;
    const message = req.query.message || req.body.message;
    const orderId = req.query.orderId || req.body.orderId;
    const amount = req.query.amount || req.body.amount;
    const transId = req.query.transId || req.body.transId;
    
    console.log('Momo callback received:', { 
      resultCode, 
      message, 
      orderId, 
      amount, 
      transId,
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      body: req.body
    });

    // Kiểm tra nếu không có orderId
    if (!orderId) {
      console.log('No orderId provided in callback');
      return res.status(400).json({ success: false, message: 'Thiếu orderId' });
    }

    // Tìm user từ orderId (format: userId_timestamp)
    const userId = orderId.split('_')[0];
    console.log('Extracted userId from orderId:', userId);
    
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      console.log('Wallet not found for userId:', userId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví' });
    }

    console.log('Current wallet balance:', wallet.balance);

    // Kiểm tra nếu giao dịch đã được xử lý
    const existingTransaction = wallet.history.find(h => 
      h.type === 'deposit' && h.txId === transId && h.status === 'success'
    );
    if (existingTransaction) {
      console.log('Transaction already processed:', transId);
      return res.json({ success: true, message: 'Giao dịch đã được xử lý', balance: wallet.balance });
    }

    // Xử lý kết quả thanh toán
    if (resultCode === '0' || resultCode === 0) {
      // Thành công
      const depositAmount = Number(amount);
      wallet.balance += depositAmount;
      wallet.history.push({
        type: 'deposit',
        amount: depositAmount,
        method: 'momo',
        status: 'success',
        txId: transId,
        orderId: orderId,
        createdAt: new Date()
      });
      await wallet.save();
      console.log('Đã cộng tiền thành công:', { userId, amount: depositAmount, transId, newBalance: wallet.balance });

      // Gửi notification cho user khi nạp tiền thành công
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Nạp tiền thành công',
          content: `Bạn đã nạp thành công ${depositAmount.toLocaleString()} VNĐ vào ví.`,
          type: 'success',
          receiver: userId,
          icon: 'plus-circle',
          meta: { amount: depositAmount, link: '/wallet' }
        });
        console.log('Notification created for successful deposit');
      } catch (notiErr) {
        console.error('Lỗi tạo notification nạp tiền:', notiErr);
      }
    } else {
      // Thất bại
      const depositAmount = Number(amount);
      wallet.history.push({
        type: 'deposit',
        amount: depositAmount,
        method: 'momo',
        status: 'failed',
        txId: transId,
        orderId: orderId,
        createdAt: new Date()
      });
      await wallet.save();
      console.log('Giao dịch thất bại:', { userId, amount: depositAmount, transId, resultCode, message });
    }

    res.json({ success: true, message: 'Đã xử lý kết quả thanh toán' });
  } catch (err) {
    console.error('handlePaymentResult error:', err);
    res.status(500).json({ success: false, message: 'Lỗi xử lý kết quả thanh toán', error: err.message });
  }
};

// Callback/payment result cho ZaloPay
exports.handleZaloPayCallback = async (req, res) => {
  try {
    console.log('ZaloPay callback received:', {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      body: req.body
    });

    // ZaloPay gửi callback qua query parameters
    const appTransId = req.query.apptransid || req.body.apptransid;
    const resultCode = req.query.resultcode || req.body.resultcode;
    const message = req.query.message || req.body.message;
    const amount = req.query.amount || req.body.amount;
    const checksum = req.query.checksum || req.body.checksum;

    console.log('ZaloPay callback params:', { 
      appTransId, 
      resultCode, 
      message, 
      amount, 
      checksum 
    });

    // Kiểm tra nếu không có appTransId
    if (!appTransId) {
      console.log('No appTransId provided in ZaloPay callback');
      return res.status(400).json({ success: false, message: 'Thiếu appTransId' });
    }

    // Tìm thông tin deposit từ appTransId
    const deposit = await UserWalletDeposit.findOne({ app_trans_id: appTransId });
    if (!deposit) {
      console.log('Deposit not found for appTransId:', appTransId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông tin giao dịch' });
    }

    const userId = deposit.userId;
    console.log('Found deposit for userId:', userId);
    
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      console.log('Wallet not found for userId:', userId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví' });
    }

    console.log('Current wallet balance:', wallet.balance);

    // Kiểm tra nếu giao dịch đã được xử lý
    const existingTransaction = wallet.history.find(h => 
      h.type === 'deposit' && h.txId === appTransId && h.status === 'success'
    );
    if (existingTransaction) {
      console.log('ZaloPay transaction already processed:', appTransId);
      return res.json({ success: true, message: 'Giao dịch đã được xử lý', balance: wallet.balance });
    }

    // Xử lý kết quả thanh toán ZaloPay
    console.log('Processing ZaloPay result with resultCode:', resultCode, 'type:', typeof resultCode);
    
    // ZaloPay có thể trả về resultCode là '1', 1, hoặc các giá trị khác
    // Theo tài liệu ZaloPay: 1 = success, 0 = failed, nhưng có thể có các giá trị khác
    const isSuccess = resultCode === '1' || resultCode === 1;
    const isFailed = resultCode === '0' || resultCode === 0;
    
    // Nếu không có resultCode hoặc resultCode không rõ ràng, kiểm tra message
    const hasSuccessMessage = message && (
      message.toLowerCase().includes('thành công') || 
      message.toLowerCase().includes('success') ||
      message.toLowerCase().includes('ok')
    );
    
    // Kiểm tra nếu có appTransId và amount - có thể là thành công
    const hasValidData = appTransId && (amount || deposit.amount);
    
    // Quyết định thành công dựa trên resultCode, message, hoặc dữ liệu hợp lệ
    const shouldProcessAsSuccess = isSuccess || (!isFailed && (hasSuccessMessage || hasValidData));
    
    if (shouldProcessAsSuccess) {
      // Thành công - ZaloPay có thể trả về '0' hoặc '1' cho thành công
      const depositAmount = Number(amount || deposit.amount);
      wallet.balance += depositAmount;
      wallet.history.push({
        type: 'deposit',
        amount: depositAmount,
        method: 'zalopay',
        status: 'success',
        txId: appTransId,
        orderId: appTransId,
        createdAt: new Date()
      });
      await wallet.save();
      console.log('Đã cộng tiền thành công từ ZaloPay:', { userId, amount: depositAmount, appTransId, newBalance: wallet.balance, resultCode });

      // Gửi notification cho user khi nạp tiền thành công
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Nạp tiền thành công',
          content: `Bạn đã nạp thành công ${depositAmount.toLocaleString()} VNĐ vào ví qua ZaloPay.`,
          type: 'success',
          receiver: userId,
          icon: 'plus-circle',
          meta: { amount: depositAmount, link: '/wallet' }
        });
        console.log('Notification created for successful ZaloPay deposit');
      } catch (notiErr) {
        console.error('Lỗi tạo notification nạp tiền ZaloPay:', notiErr);
      }

      res.json({ 
        success: true, 
        message: 'Thanh toán thành công', 
        balance: wallet.balance,
        amount: depositAmount
      });
    } else {
      // Thất bại hoặc trạng thái không xác định
      const depositAmount = Number(amount || deposit.amount);
      wallet.history.push({
        type: 'deposit',
        amount: depositAmount,
        method: 'zalopay',
        status: 'failed',
        txId: appTransId,
        orderId: appTransId,
        createdAt: new Date()
      });
      await wallet.save();
      console.log('ZaloPay transaction failed or unknown status:', { userId, amount: depositAmount, appTransId, resultCode, message });

      res.json({ 
        success: false, 
        message: message || `Thanh toán thất bại (resultCode: ${resultCode})`,
        balance: wallet.balance
      });
    }
  } catch (err) {
    console.error('handleZaloPayCallback error:', err);
    res.status(500).json({ success: false, message: 'Lỗi xử lý kết quả thanh toán ZaloPay', error: err.message });
  }
};

// API endpoint để frontend gửi kết quả thanh toán
exports.paymentCallback = async (req, res) => {
  try {
    const { orderId, resultCode, message, amount, method, transId } = req.body;
    console.log('Payment callback from frontend:', { orderId, resultCode, message, amount, method, transId });

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Thiếu orderId' });
    }

    // Tìm user từ orderId (format: userId_timestamp)
    const userId = orderId.split('_')[0];
    console.log('Extracted userId from orderId:', userId);
    
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      console.log('Wallet not found for userId:', userId);
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví' });
    }

    console.log('Current wallet balance:', wallet.balance);

    // Kiểm tra nếu giao dịch đã được xử lý (sử dụng transId nếu có, không thì dùng orderId)
    const existingTransaction = wallet.history.find(h => 
      h.type === 'deposit' && 
      ((transId && h.txId === transId) || (!transId && h.orderId === orderId)) && 
      h.status === 'success'
    );
    if (existingTransaction) {
      console.log('Transaction already processed:', transId || orderId);
      return res.json({ success: true, message: 'Giao dịch đã được xử lý', balance: wallet.balance });
    }

    // Xử lý kết quả thanh toán
    if (resultCode === '0' || resultCode === 0) {
      // Thành công
      const depositAmount = Number(amount);
      wallet.balance += depositAmount;
      wallet.history.push({
        type: 'deposit',
        amount: depositAmount,
        method: method || 'unknown',
        status: 'success',
        orderId: orderId,
        txId: transId,
        createdAt: new Date()
      });
      await wallet.save();
      console.log('Đã cộng tiền thành công:', { userId, amount: depositAmount, orderId, transId, newBalance: wallet.balance });

      // Gửi notification cho user khi nạp tiền thành công
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Nạp tiền thành công',
          content: `Bạn đã nạp thành công ${depositAmount.toLocaleString()} VNĐ vào ví.`,
          type: 'success',
          receiver: userId,
          icon: 'plus-circle',
          meta: { amount: depositAmount, link: '/wallet' }
        });
        console.log('Notification created for successful deposit');
      } catch (notiErr) {
        console.error('Lỗi tạo notification nạp tiền:', notiErr);
      }

      res.json({ 
        success: true, 
        message: 'Đã xử lý kết quả thanh toán thành công',
        balance: wallet.balance,
        amount: depositAmount
      });
    } else {
      // Thất bại
      const depositAmount = Number(amount);
      wallet.history.push({
        type: 'deposit',
        amount: depositAmount,
        method: method || 'unknown',
        status: 'failed',
        orderId: orderId,
        txId: transId,
        createdAt: new Date()
      });
      await wallet.save();
      console.log('Giao dịch thất bại:', { userId, amount: depositAmount, orderId, transId, resultCode, message });

      res.json({ 
        success: true, 
        message: 'Đã ghi nhận giao dịch thất bại',
        balance: wallet.balance
      });
    }
  } catch (err) {
    console.error('paymentCallback error:', err);
    res.status(500).json({ success: false, message: 'Lỗi xử lý kết quả thanh toán', error: err.message });
  }
};

// User gửi yêu cầu rút tiền
exports.requestWithdraw = async (req, res) => {
  try {
    const { amount, bank, account, holder } = req.body;
    const userId = req.user._id;
    const wallet = await UserWallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ success: false, message: 'Số dư không đủ' });
    }
    // Trừ tiền ngay và ghi lịch sử với trạng thái chờ duyệt
    wallet.balance -= amount;
    wallet.history.push({
      type: 'withdraw',
      amount: -amount,
      method: bank,
      status: 'pending',
      createdAt: new Date(),
    });
    await wallet.save();
    const request = new UserWithdrawRequest({
      userId, amount, bank, account, holder
    });
    await request.save();
    res.json({ success: true, message: 'Đã gửi yêu cầu rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi gửi yêu cầu rút tiền', error: err.message });
  }
};

// Admin xem danh sách yêu cầu rút tiền của user
exports.getWithdrawRequests = async (req, res) => {
  try {
    const requests = await UserWithdrawRequest.find().populate('userId', 'fullname email avatar phone');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu cầu rút tiền', error: err.message });
  }
};

// User xem lịch sử yêu cầu rút tiền của mình
exports.getMyWithdrawRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await UserWithdrawRequest.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách yêu cầu rút tiền', error: err.message });
  }
};

// Admin duyệt yêu cầu rút tiền
exports.approveWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await UserWithdrawRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ' });
    }
    request.status = 'approved';
    request.approvedAt = new Date();
    await request.save();
    // Cập nhật lịch sử ví - thay đổi status từ "pending" thành "approved"
    const wallet = await UserWallet.findOne({ userId: request.userId });
    if (wallet) {
      const pendingHistory = wallet.history.find(h =>
        h.type === 'withdraw' &&
        h.amount === -request.amount &&
        h.status === 'pending'
      );
      if (pendingHistory) {
        pendingHistory.status = 'approved';
      }
      await wallet.save();
      // Gửi notification cho user khi rút tiền thành công
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Rút tiền thành công',
          content: `Bạn đã rút thành công ${Number(request.amount).toLocaleString()} VNĐ khỏi ví.`,
          type: 'success',
          receiver: request.userId,
          icon: 'minus-circle',
          meta: { amount: Number(request.amount), link: '/wallet' }
        });
      } catch (notiErr) {
        console.error('Lỗi tạo notification rút tiền:', notiErr);
      }
    }
    res.json({ success: true, message: 'Đã duyệt rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi duyệt rút tiền', error: err.message });
  }
};

// Admin từ chối yêu cầu rút tiền
exports.rejectWithdraw = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await UserWithdrawRequest.findById(id);
    if (!request || request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ' });
    }
    // Hoàn lại tiền vào ví và cập nhật lịch sử
    const wallet = await UserWallet.findOne({ userId: request.userId });
    if (wallet) {
      wallet.balance += request.amount;
      const pendingHistory = wallet.history.find(h =>
        h.type === 'withdraw' &&
        h.amount === -request.amount &&
        h.status === 'pending'
      );
      if (pendingHistory) {
        pendingHistory.status = 'rejected';
      }
      await wallet.save();
    }
    request.status = 'rejected';
    request.note = reason;
    await request.save();
    res.json({ success: true, message: 'Đã từ chối yêu cầu rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi từ chối yêu cầu rút tiền', error: err.message });
  }
};

// User hủy yêu cầu rút tiền của mình
exports.cancelWithdrawRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const request = await UserWithdrawRequest.findOne({ _id: id, userId });
    if (!request) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy yêu cầu rút tiền' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Yêu cầu đã được xử lý, không thể hủy' });
    }
    // Hoàn lại tiền vào ví và cập nhật lịch sử
    const wallet = await UserWallet.findOne({ userId });
    if (wallet) {
      wallet.balance += request.amount;
      const pendingHistory = wallet.history.find(h =>
        h.type === 'withdraw' &&
        h.amount === -request.amount &&
        h.status === 'pending'
      );
      if (pendingHistory) {
        pendingHistory.status = 'cancelled';
      }
      await wallet.save();
    }
    request.status = 'cancelled';
    request.cancelledAt = new Date();
    request.note = 'Bạn đã hủy yêu cầu rút tiền';
    await request.save();
    res.json({ success: true, message: 'Đã hủy yêu cầu rút tiền', request });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi hủy yêu cầu rút tiền', error: err.message });
  }
}; 

// API để kiểm tra trạng thái giao dịch
exports.checkTransactionStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    console.log('Checking transaction status for:', { orderId, userId });
    
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví' });
    }

    // Tìm giao dịch trong lịch sử
    const transaction = wallet.history.find(h => h.orderId === orderId);
    
    if (!transaction) {
      return res.json({ 
        success: true, 
        status: 'not_found',
        message: 'Không tìm thấy giao dịch'
      });
    }

    return res.json({
      success: true,
      status: transaction.status,
      amount: transaction.amount,
      method: transaction.method,
      createdAt: transaction.createdAt,
      balance: wallet.balance
    });

  } catch (err) {
    console.error('checkTransactionStatus error:', err);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái giao dịch' });
  }
}; 

// API để kiểm tra trạng thái giao dịch theo transId
exports.checkTransactionByTransId = async (req, res) => {
  try {
    const { transId } = req.params;
    const userId = req.user._id;
    
    console.log('Checking transaction by transId:', { transId, userId });
    
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ví' });
    }

    // Tìm giao dịch trong lịch sử theo transId
    const transaction = wallet.history.find(h => h.txId === transId);
    
    if (!transaction) {
      return res.json({ 
        success: true, 
        status: 'not_found',
        message: 'Không tìm thấy giao dịch'
      });
    }

    return res.json({
      success: true,
      status: transaction.status,
      amount: transaction.amount,
      method: transaction.method,
      orderId: transaction.orderId,
      createdAt: transaction.createdAt,
      balance: wallet.balance
    });

  } catch (err) {
    console.error('checkTransactionByTransId error:', err);
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái giao dịch' });
  }
}; 