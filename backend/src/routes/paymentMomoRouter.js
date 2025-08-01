const express = require("express");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const dayjs = require("dayjs");
const qs = require("qs");
const { auth } = require("../middlewares/auth");
const OrderController = require("../controllers/order.controller");

const momoRouter = express.Router();

const config = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  requestType: "captureWallet",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: "http://localhost:5173/payment-result?paymentMethod=momo",
  ipnUrl: "http://localhost:5000/api/orders/momo-callback",
};

momoRouter.post("/create_momo_payment", auth, async (req, res) => {
  try {
    const { amount, name, email, orderData } = req.body;

    // Tạo orderId từ timestamp
    const orderId = `MOMO_${dayjs().format("YYMMDD_HHmmss")}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Creating MoMo payment with orderId:', orderId);
    
    console.log('Creating MoMo payment with orderId:', orderId);

    const requestId = orderId;

    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=Thanh toán qua MoMo&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${config.requestType}`;

    const signature = CryptoJS.HmacSHA256(rawSignature, config.secretKey).toString();

    const body = {
      partnerCode: config.partnerCode,
      accessKey: config.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo: "Thanh toán qua MoMo",
      redirectUrl: config.redirectUrl,
      ipnUrl: config.ipnUrl,
      extraData: "",
      requestType: config.requestType,
      signature,
      lang: "vi",
    };

    const momoRes = await axios.post(config.endpoint, body);
    
    console.log('MoMo payment URL created:', momoRes.data.payUrl);
    res.status(200).json({ payUrl: momoRes.data.payUrl, orderId });
  } catch (error) {
    console.error("Momo error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Lỗi tạo đơn MoMo" });
  }
});

module.exports = momoRouter;
