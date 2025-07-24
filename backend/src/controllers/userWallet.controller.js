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
    const { amount, method } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Số tiền không hợp lệ' });
    if (!['momo', 'vnpay', 'zalopay'].includes(method)) return res.status(400).json({ success: false, message: 'Phương thức không hợp lệ' });

    // Tạo mã giao dịch duy nhất
    const depositId = `${req.user._id}_${Date.now()}`;
    let payUrl = '';

    if (method === 'momo') {
      // Momo config
      const momoConfig = {
        partnerCode: "MOMO",
        accessKey: "F8BBA842ECF85",
        secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
        requestType: "captureWallet",
        endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
        redirectUrl: "http://localhost:5173/wallet/payment-result?paymentMethod=momo",
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
        returnUrl: "http://localhost:5173/wallet/payment-result?paymentMethod=vnpay",
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
        return_url: "http://localhost:5173/wallet/payment-result?paymentMethod=zalopay",
        redirecturl: "http://localhost:5173/wallet/payment-result?paymentMethod=zalopay"
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

// Xử lý callback/payment result từ các cổng thanh toán
exports.handlePaymentResult = async (req, res) => {
  try {
    // Xác định cổng thanh toán
    const isMomo = req.originalUrl.includes('momo');
    const isZaloPay = req.originalUrl.includes('zalopay');
    const isVnpay = req.originalUrl.includes('vnpay');
    let userId, amount, status, txId;

    if (isMomo) {
      // Momo IPN: req.body chứa thông tin
      // Giả sử extraData chứa userId
      const { resultCode, amount: momoAmount, extraData, orderId } = req.body;
      userId = extraData || null;
      amount = momoAmount;
      status = resultCode === 0 ? 'success' : 'fail';
      txId = orderId;
    } else if (isZaloPay) {
      if (req.method === 'GET') {
        // Xác thực từ frontend: lấy từ query
        txId = req.query.apptransid || req.query.app_trans_id;
        // Tra ngược userId từ DB tạm
        const deposit = await UserWalletDeposit.findOne({ app_trans_id: txId });
        if (deposit) {
          userId = deposit.userId;
          amount = deposit.amount;
        }
        status = req.query.status === '1' ? 'success' : 'fail';
      } else {
        // Callback thực sự từ ZaloPay (POST)
        const dataStr = req.body.data;
        const data = JSON.parse(dataStr);
        userId = data.app_user;
        amount = data.amount;
        status = data.status === 1 ? 'success' : 'fail';
        txId = data.app_trans_id;
      }
    } else if (isVnpay) {
      // VNPAY returnUrl: req.query chứa thông tin
      const { vnp_ResponseCode, vnp_Amount, vnp_TxnRef, vnp_OrderInfo } = req.query;
      // Cần mapping vnp_TxnRef với userId (nếu lưu tạm khi tạo deposit)
      // Ở đây demo: vnp_TxnRef = userId_timestamp
      if (vnp_TxnRef && vnp_TxnRef.includes('_')) {
        userId = vnp_TxnRef.split('_')[0];
      }
      amount = vnp_Amount ? parseInt(vnp_Amount, 10) / 100 : 0;
      status = vnp_ResponseCode === '00' ? 'success' : 'fail';
      txId = vnp_TxnRef;
    }

    if (!userId || !amount || status !== 'success') {
      return res.json({ success: false, message: 'Giao dịch không hợp lệ hoặc thất bại' });
    }

    // Cộng tiền vào ví nếu chưa cộng trước đó
    const UserWallet = require('../models/UserWallet');
    let wallet = await UserWallet.findOne({ userId });
    if (!wallet) {
      wallet = await UserWallet.create({ userId });
    }
    // Log txId và lịch sử
    console.log('Check idempotency:', { txId, history: wallet.history.map(h => h.txId) });
    // So sánh txId chuẩn hóa
    const norm = v => (v ? String(v).trim().toLowerCase() : '');
    const existed = wallet.history.find(h => h.type === 'deposit' && h.status === 'success' && norm(h.txId) === norm(txId));
    let alreadyAmount = existed ? existed.amount : null;
    if (existed) {
      console.log('Giao dịch đã tồn tại, không cộng tiền:', txId);
    } else {
      wallet.balance += Number(amount);
      wallet.history.push({
        type: 'deposit',
        amount: Number(amount),
        method: isMomo ? 'momo' : isZaloPay ? 'zalopay' : 'vnpay',
        status: 'success',
        txId: norm(txId),
        createdAt: new Date()
      });
      await wallet.save();
      console.log('Đã cộng tiền và ghi lịch sử:', { userId, amount, txId });
      // Gửi notification cho user khi nạp tiền thành công
      try {
        const Notification = require('../models/Notification');
        await Notification.create({
          title: 'Nạp tiền thành công',
          content: `Bạn đã nạp thành công ${Number(amount).toLocaleString()} VNĐ vào ví.`,
          type: 'success',
          receiver: userId,
          icon: 'plus-circle',
          meta: { amount: Number(amount), link: '/wallet' }
        });
      } catch (notiErr) {
        console.error('Lỗi tạo notification nạp tiền:', notiErr);
      }
    }
    return res.json({ success: true, message: 'Nạp tiền thành công', balance: wallet.balance, amount: alreadyAmount || Number(amount) });
  } catch (err) {
    console.error('handlePaymentResult error:', err);
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