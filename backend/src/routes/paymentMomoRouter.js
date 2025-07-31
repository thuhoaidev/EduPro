const express = require("express");
const axios = require("axios");
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
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

momoRouter.post("/create_momo_payment", async (req, res) => {
  try {
    const { amount, name, email, orderData } = req.body;

    // Tạo đơn hàng trước
    let orderId;
    if (orderData) {
      // Tạo đơn hàng với paymentMethod: 'momo'
      const orderPayload = {
        ...orderData,
        paymentMethod: 'momo'
      };
      
      // Gọi OrderController để tạo đơn hàng
      const orderResponse = await OrderController.createOrder({
        body: orderPayload,
        user: req.user
      }, {
        status: (code) => ({ status: code }),
        json: (data) => data
      });

      if (orderResponse.success) {
        orderId = orderResponse.data.order.id;
        console.log('Order created for Momo payment:', orderId);
      } else {
        return res.status(400).json({ message: orderResponse.message || "Lỗi tạo đơn hàng" });
      }
    } else {
      // Fallback: tạo orderId từ timestamp nếu không có orderData
      orderId = `${moment().format("YYMMDD_HHmmss")}`;
    }

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
    res.status(200).json({ payUrl: momoRes.data.payUrl, orderId });
  } catch (error) {
    console.error("Momo error:", error?.response?.data || error.message);
    res.status(500).json({ message: "Lỗi tạo đơn MoMo" });
  }
});

module.exports = momoRouter;
