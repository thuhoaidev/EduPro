const express = require("express");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");

const momoRouter = express.Router();

const config = {
  partnerCode: "MOMO",
  accessKey: "F8BBA842ECF85",
  secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  requestType: "captureWallet",
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl: "http://localhost:5173/payment-result?paymentMethod=momo",
  ipnUrl: "http://localhost:5000/api/payment-momo/callback",
};

momoRouter.post("/create_momo_payment", async (req, res) => {
  const { amount, name, email } = req.body;

  const orderId = `${moment().format("YYMMDD_HHmmss")}`;
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

  try {
    const momoRes = await axios.post(config.endpoint, body);
    res.status(200).json({ payUrl: momoRes.data.payUrl });
  } catch (error) {
    console.error("Momo error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Lỗi tạo đơn MoMo" });
  }
});

// Momo callback handler
momoRouter.post("/callback", (req, res) => {
  try {
    const { resultCode, message, orderId, amount, signature } = req.body;
    
    console.log('🔍 Momo callback received:', req.body);
    
    // Verify signature if needed
    // For now, just check resultCode
    if (resultCode === 0) {
      console.log('✅ Momo payment successful:', orderId);
      res.json({ returnCode: 0, message: 'Success' });
    } else {
      console.log('❌ Momo payment failed:', message);
      res.json({ returnCode: 1, message: 'Failed' });
    }
  } catch (error) {
    console.error('❌ Momo callback error:', error);
    res.status(500).json({ returnCode: 1, message: 'Error' });
  }
});

module.exports = momoRouter;
